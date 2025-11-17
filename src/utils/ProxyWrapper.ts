import isTraceable from "./isTraceable.js";
import EventEmitter from "./EventEmitter.js";
import ProxyEvent from "../events/ProxyEvent.js";
import isProxy from "./isProxy.js";
import generateId from "./generateId.js";
import getProxyMap from "./getProxyMap.js";
import getSandbox from "./getSandbox.js";
import createHandlers from "../handlers/index.js";

/**
 * A wrapper class that manages a proxy and its associated events.
 * The `ProxyWrapper` encapsulates the functionality of proxy operations and ensures
 * that event listeners are triggered appropriately. It also provides the ability
 * to revoke the proxy and manage traceability.
 *
 */

class ProxyWrapper<T extends object = nx.Proxy> implements nx.ProxyWrapper<T> {
  get revoked(): boolean {
    return this.isRevoked;
  }

  get events(): nx.EventEmitter<nx.ProxyEvents> | undefined {
    return this.eventEmitter;
  }

  get id(): string {
    return this.proxyId;
  }

  get target(): T {
    return this.proxyTarget;
  }

  get manager(): nx.ProxyManager | undefined {
    return this.proxyManager;
  }

  get traceable(): boolean {
    return this.isTraceable;
  }

  get proxy(): nx.ProxyTarget<T> | undefined {
    return this.proxyRef.deref();
  }

  /** The underlying target object */
  private proxyTarget: T;

  /** Whether the `proxy` was created with a custom target object */
  private isTraceable: boolean = false;

  /** The proxy manager associated with the proxy */
  private proxyManager?: nx.ProxyManager;

  /** Event emitter instance */
  private eventEmitter?: nx.EventEmitter = new EventEmitter();

  /** Indicates whether the proxy has been revoked */
  private isRevoked: boolean = false;

  /** The function responsible for revoking the proxy */
  private revoker?: () => void;

  /** A weak reference to the proxy being wrapped */
  private proxyRef: WeakRef<nx.ProxyTarget<T>>;

  /** A unique identifier for the proxy */
  private proxyId: string = generateId();

  /** Method to create or update an existing proxy */
  private upsertProxy(target?: object): void {
    const traceable = isTraceable(target);
    const targetObject = traceable ? target : getSandbox();
    const prevProxy = this.proxyRef?.deref();
    const prevRevoker = this.revoker;

    const { proxy, revoke } = Proxy.revocable<nx.ProxyTarget<T>>(
      targetObject as nx.ProxyTarget<T>,
      createHandlers(() => this.proxyRef.deref()),
    );

    this.proxyTarget = targetObject as T;
    this.isTraceable = traceable;
    this.proxyRef = new WeakRef(proxy);
    this.revoker = prevRevoker
      ? () => {
          prevRevoker();
          revoke();
        }
      : revoke;

    const map = getProxyMap();

    map.delete(prevProxy);
    map.set(proxy, this);
  }

  /**
   * Creates an instance of `ProxyWrapper`.
   *
   * @param target - The target object for the initial proxy
   */
  constructor(target?: null);
  constructor(target?: T);

  constructor(target?: T) {
    this.upsertProxy(target);
  }

  revoke(): void {
    if (this.isRevoked) return;

    if (typeof this.revoker === "function") {
      this.revoker();
    }

    this.isRevoked = true;
    this.revoker = undefined;

    const proxy = this.proxyRef.deref();

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
    const proxy = this.proxyRef.deref();

    this.proxyManager = manager;

    // find proxy manager
    if (manager && previousManager !== manager && isProxy(proxy)) {
      // create the `proxy.manager` event
      const event = new ProxyEvent("manager", {
        target: proxy,
        cancelable: false,
        data: this,
      }) as nx.ProxyWrapperEvent;
      // emit the event to the manager
      manager.events?.emit(event.name, event);
    }

    return this;
  }

  removeManager(): this {
    this.proxyManager = undefined;
    return this;
  }

  setTarget(target: object): this {
    if (this.target === target) return this;
    if (this.isRevoked) return this;

    this.upsertProxy(target);

    const proxy = this.proxyRef?.deref();

    if (this.manager && isProxy(proxy)) {
      // create the event
      const event = new ProxyEvent("target", {
        target: proxy,
        cancelable: false,
        data: this,
      }) as nx.ProxyWrapperEvent;
      // emit the event to the manager
      this.manager.events?.emit(event.name, event);
    }

    return this;
  }

  setId(id: string): this {
    if (this.isRevoked) return this;
    if (typeof id !== "string" || !id.length) return this;

    this.proxyId = id;

    const proxy = this.proxyRef.deref();

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
