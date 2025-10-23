import TraceableMap from "./utils/TraceableMap.js";
import EventEmitter from "./utils/EventEmitter.js";
import isProxy from "./utils/isProxy.js";
import isTraceable from "./utils/isTraceable.js";
import getProxyWrapper from "./utils/getProxyWrapper.js";
import getProxy from "./utils/getProxy.js";
import emitProxy from "./utils/emitProxy.js";

/**
 * Represents a proxy factory for creating and managing proxy objects.
 *
 * @remarks
 * This class provides utilities for creating proxies, retrieving existing ones by unique IDs, and interacting with them through event-driven mechanisms.
 *
 * It emits the following events:
 * - `proxy`: Fired whenever a new proxy is created.
 * - `error`: Fired when an error occurs.
 * - `proxy.handler`: Fired when any proxy handler function is invoked.
 * - `proxy.error`: Fired when a proxy operation fails.
 *
 * @example
 * // Example of listening to 'proxy' event every time a new proxy is created.
 * const nexo = new Nexo();
 * const listener = (event: Event) => {};
 *
 * nexo.events.on('proxy', listener);
 *
 * // The listener will be called when a new proxy is created.
 * const proxy = nexo.create();
 */
class Nexo implements nx.ProxyManager {
  /**
   * A map that stores unique proxy IDs associated with their respective {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef | WeakRef} references to the proxy objects.
   *
   * @remarks
   * This map allows quick access to proxies by their unique ID, ensuring that proxies are properly managed and referenced.
   */
  readonly entries = new TraceableMap<nx.Proxy>();

  static isProxy = isProxy;
  static isTraceable = isTraceable;
  static wrap = getProxyWrapper;

  private eventEmitter?: nx.EventEmitter = new EventEmitter();

  get events(): nx.EventEmitter<nx.ProxyEvents & nx.Events> {
    return this.eventEmitter;
  }

  /**
   * Creates or retrieves a proxy by its unique ID.
   *
   * @remarks
   * - If an ID already exists and no target is provided, the existing proxy is returned.
   * - If a target is provided, a new proxy is created and associated with the given ID,
   *   regardless of whether the ID was used before.
   *
   * This allows reusing the same ID with updated targets and also creating multiple proxies
   * for the same target under different IDs.
   *
   * @example
   * const nexo = new Nexo();
   *
   * // First use creates a proxy
   * const proxy1 = nexo.use('foo', {});
   *
   * // Retrieves the existing proxy by ID
   * const proxy2 = nexo.use('foo');
   * console.log(proxy1 === proxy2); // true
   *
   * // Replaces the proxy under the same ID with a new target
   * const proxy3 = nexo.use('foo', { updated: true });
   * console.log(proxy3 !== proxy1); // true
   *
   * @param id - A stable identifier to associate with the proxy.
   * @param target - An optional object to wrap in a proxy.
   * @returns A proxy associated with the ID and optional target.
   */

  use(id: string, target?: object): nx.Proxy {
    // Return proxy used by the ID
    if (!target && this.entries.has(id)) {
      const proxy = this.entries.get(id)?.deref();
      if (proxy) return proxy;
    }

    const proxy = getProxy(target);
    const wrapper = getProxyWrapper(proxy);

    wrapper.setManager(this).setId(id);

    const finalProxy = emitProxy(proxy);

    this.entries.set(wrapper.id, new WeakRef(finalProxy));

    return finalProxy;
  }

  /**
   * Creates a new proxy for a given target.
   *
   * @remarks
   * This method always returns a new proxy, even when called multiple times with the same target.
   * Use this method when you need isolated proxies or don't require a persistent reference by ID.
   *
   * To retrieve or reuse proxies by ID, prefer using `nexo.use(id, target)` instead.
   *
   * @param target - An optional object to associate with the proxy. Defaults to a blank function.
   * @returns A new proxy wrapping the given target.
   *
   * @example
   * const nexo = new Nexo();
   * const proxy = nexo.create();
   *
   * // Create proxies for the same target
   * const proxy1 = nexo.create(console.log);
   * const proxy2 = nexo.create(console.log);
   * console.log(proxy1 === proxy2); // false
   */
  create(target?: object): nx.Proxy {
    const proxy = getProxy(target);
    const wrapper = getProxyWrapper(proxy);

    wrapper.setManager(this);

    const finalProxy = emitProxy(proxy);

    this.entries.set(wrapper.id, new WeakRef(finalProxy));

    return finalProxy;
  }

  setEventEmitter(emitter: nx.EventEmitter): this {
    this.eventEmitter = emitter;
    return this;
  }

  removeEventEmitter(): this {
    this.eventEmitter = undefined;
    return this;
  }
}

export default Nexo;
