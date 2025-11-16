import isTraceable from "./isTraceable.js";
import EventEmitter from "./EventEmitter.js";
import ProxyEvent from "../events/ProxyEvent.js";
import isProxy from "./isProxy.js";

/**
 * A wrapper class that manages a proxy and its associated events.
 * The `ProxyWrapper` encapsulates the functionality of proxy operations and ensures
 * that event listeners are triggered appropriately. It also provides the ability
 * to revoke the proxy and manage traceability.
 *
 */

class ProxyWrapper implements nx.ProxyWrapper {
  get revoked(): boolean {
    return this.isRevoked;
  }

  get events(): nx.EventEmitter<nx.ProxyEvents> | undefined {
    return this.eventEmitter;
  }

  get id(): string {
    return this.proxyId;
  }

  get target(): object {
    return this.proxyTarget;
  }

  get manager(): nx.ProxyManager | undefined {
    return this.proxyManager;
  }

  get traceable(): boolean {
    return this.isTraceable;
  }

  /** The underlying target object */
  private proxyTarget: object;

  /** Whether the `proxy` was created with a custom target object */
  private isTraceable: boolean = false;

  /** The proxy manager associated with the proxy */
  private proxyManager?: nx.ProxyManager;

  /** Event emitter instance */
  private eventEmitter?: nx.EventEmitter = new EventEmitter();

  /** Indicates whether the proxy has been revoked */
  private isRevoked: boolean = false;

  /** The function responsible for revoking the proxy */
  private revokeProxy?: () => void;

  /** Private counter for unique id generation */
  private static size = 0;

  /** A weak reference to the proxy being wrapped */
  private proxy?: WeakRef<object>;

  /** A unique identifier for the proxy */
  private proxyId: string = (++ProxyWrapper.size + Date.now())
    .toString(36)
    .toUpperCase();

  /**
   * Creates an instance of `ProxyWrapper`.
   *
   * @param proxy - The proxy that is being wrapped
   * @param revoke - The function responsible for revoking the proxy
   */
  constructor(proxy: object = null, revoke?: () => void) {
    if (proxy) {
      this.proxy = new WeakRef(proxy);
    }
    this.revokeProxy = revoke;
  }

  revoke(): void {
    if (this.isRevoked) return;

    if (typeof this.revokeProxy === "function") {
      this.revokeProxy();
    }

    this.isRevoked = true;
    this.revokeProxy = undefined;

    const proxy = this.proxy?.deref();

    // find proxy manager
    if (this.manager && isProxy(proxy)) {
      // create the `proxy.revoke` event
      const event = new ProxyEvent("revoke", {
        target: proxy,
        cancelable: false,
        data: this,
      }) as nx.ProxyWrapperEvent;
      // emit the event to the manager
      this.manager.events?.emit(event.name, event);
    }
  }

  setEventEmitter(emitter: nx.EventEmitter): this {
    if (this.isRevoked) return this;
    this.eventEmitter = emitter;
    return this;
  }

  removeEventEmitter(): this {
    this.eventEmitter = undefined;
    return this;
  }

  setManager(manager: nx.ProxyManager): this {
    if (this.isRevoked) return this;

    const previousManager = this.proxyManager;
    const proxy = this.proxy?.deref();

    this.proxyManager = manager;

    // find proxy manager
    if (manager && previousManager !== manager && isProxy(proxy)) {
      // create the `proxy.manager` event
      const event = new ProxyEvent("manager", {
        target: proxy,
        cancelable: false,
        data: this,
      }) as nx.ProxyManagerEvent;
      // emit the event to the manager
      manager.events?.emit(event.name, event);
    }

    return this;
  }

  removeManager(): this {
    this.proxyManager = undefined;
    return this;
  }

  setTarget(target: object, traceable: boolean = true): this {
    if (this.isRevoked) return this;
    if (isTraceable(target)) {
      this.proxyTarget = target;
      this.isTraceable = traceable === true;
    }
    return this;
  }

  setId(id: string): this {
    if (this.isRevoked) return this;
    if (typeof id !== "string" || !id.length) return this;

    this.proxyId = id;

    const proxy = this.proxy?.deref();

    // find proxy manager
    if (this.manager && isProxy(proxy)) {
      // create the `proxy.rename` event
      const event = new ProxyEvent("rename", {
        target: proxy,
        cancelable: false,
        data: this,
      }) as nx.ProxyWrapperEvent;
      // emit the event to the manager
      this.manager.events?.emit(event.name, event);
    }

    return this;
  }
}

export default ProxyWrapper;
