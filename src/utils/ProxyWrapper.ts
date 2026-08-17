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
 * to lock the proxy and manage sandboxed targets.
 *
 */

class ProxyWrapper<T extends object = nx.Proxy> implements nx.ProxyWrapper<
  T,
  nx.ProxyEvents
> {
  get locked(): boolean {
    return this.isLocked;
  }

  get events(): nx.EventEmitter<nx.ProxyEvents> {
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
  private readonly eventEmitter = new EventEmitter<nx.ProxyEvents>();

  /** Indicates whether the proxy has been locked */
  private isLocked: boolean = false;

  /** A weak reference to the proxy being wrapped */
  private proxyRef: WeakRef<nx.ProxyTarget<T>>;

  /** A unique identifier for the proxy */
  private proxyId: string = generateId();

  /** Method to create or update an existing proxy */
  private upsertProxy(target?: object): void {
    const traceable = isTraceable(target);
    const targetObject = traceable ? target : getSandbox();
    const prevProxy = this.proxyRef?.deref();
    const map = getProxyMap();

    const proxy = new Proxy<nx.ProxyTarget<T>>(
      targetObject as nx.ProxyTarget<T>,
      createHandlers(this),
    );

    this.proxyTarget = targetObject as T;
    this.isTraceable = traceable;
    this.proxyRef = new WeakRef(proxy);

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

  lock(): this {
    if (this.isLocked) return this;

    this.isLocked = true;

    const proxy = this.proxyRef.deref();

    // find proxy manager
    if (this.manager && isProxy(proxy)) {
      // create the `proxy.lock` event
      const event = new ProxyEvent("lock", {
        target: proxy,
        cancelable: false,
        data: this,
      }) as nx.ProxyWrapperEvent;
      // emit the event to the manager
      this.manager.events?.emit(event.name, event);
    }

    return this;
  }

  unlock(): this {
    this.isLocked = false;

    const proxy = this.proxyRef.deref();

    if (this.manager && isProxy(proxy)) {
      // create the `proxy.unlock` event
      const event = new ProxyEvent("unlock", {
        target: proxy,
        cancelable: false,
        data: this,
      }) as nx.ProxyWrapperEvent;
      // emit the event to the manager
      this.manager.events?.emit(event.name, event);
    }

    return this;
  }

  setManager(manager: nx.ProxyManager): this {
    if (this.isLocked) return this;

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
    if (this.isLocked) return this;

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
    if (this.isLocked) return this;
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
