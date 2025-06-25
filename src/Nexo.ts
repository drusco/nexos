import type * as nx from "./types/Nexo.js";
import getProxy from "./utils/getProxy.js";
import NexoMap from "./utils/NexoMap.js";
import ProxyWrapper from "./utils/ProxyWrapper.js";
import maps from "./utils/maps.js";
import ProxyError from "./errors/ProxyError.js";
import NexoEmitter from "./events/NexoEmitter.js";

/**
 * Represents a proxy factory for creating and managing proxy objects.
 *
 * @remarks
 * This class provides utilities for creating proxies, retrieving existing ones by unique IDs, and interacting with them through event-driven mechanisms.
 *
 * It emits the following events:
 * - `proxy`: Fired whenever a new proxy is created.
 * - `error`: Fired when an error occurs.
 * - `proxy.handler`: Fired when any proxy **{@link Types.ProxyHandler | handler}** function is invoked.
 * - `proxy.error`: Fired when a proxy operation fails.
 *
 * @example
 * // Example of listening to 'proxy' event every time a new proxy is created.
 * const nexo = new Nexo();
 * const listener = (event: NexoEvent) => {};
 *
 * nexo.on('proxy', listener);
 *
 * // The listener will be called when a new proxy is created.
 * const proxy = nexo.create();
 */
class Nexo extends NexoEmitter {
  /**
   * A map that stores unique proxy IDs associated with their respective {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef | WeakRef} references to the proxy objects.
   *
   * @remarks
   * This map allows quick access to proxies by their unique ID, ensuring that proxies are properly managed and referenced.
   */
  readonly entries: NexoMap<nx.Proxy> = new NexoMap();

  /**
   * Provides a wrapper for an existing proxy.
   *
   * @remarks
   * This method wraps a proxy object and allows interaction with the proxy's events and properties.
   * Proxy-related events follow the format `proxy.handler`, where the **{@link Types.ProxyHandler | handler}** corresponds to one of the standard proxy handler functions such as `apply`, `construct`, `get`, etc.
   *
   * @example
   * // Wrapping an existing proxy and listening to 'proxy.get' event
   * const nexo = new Nexo();
   * const proxy = nexo.create();
   * const wrapper = Nexo.wrap(proxy);
   *
   * wrapper.on('proxy.get', (event: ProxyEvent) => {});
   *
   * @param proxy - An existing proxy object
   * @returns A wrapper for the proxy that allows interaction with proxy events
   */
  static wrap(proxy: nx.Proxy): ProxyWrapper {
    return maps.proxies.get(proxy);
  }

  /**
   * Retrieves the property descriptor for a proxy, considering its sandbox target if applicable.
   *
   * @remarks
   * Since proxies can have altered behavior, using `Reflect.getOwnPropertyDescriptor` directly may not return the expected results. This method ensures the correct descriptor is fetched from the sandbox target if the proxy was created without a direct target.
   *
   * @param proxy - An existing proxy object
   * @param property - The property name (key) to retrieve the descriptor for
   * @returns The property descriptor if the property exists, or `undefined` otherwise
   */
  static getOwnPropertyDescriptor(
    proxy: nx.Proxy,
    property: nx.ObjectKey,
  ): void | PropertyDescriptor {
    const { sandbox } = Nexo.wrap(proxy);
    if (sandbox) {
      return Reflect.getOwnPropertyDescriptor(sandbox, property);
    }
    return Reflect.getOwnPropertyDescriptor(proxy, property);
  }

  /**
   * Retrieves the own property keys of a proxy, considering its sandbox target if applicable.
   *
   * @remarks
   * Similar to the property descriptor method, this method ensures that the keys returned are from the sandbox target when the proxy was created without a direct target.
   *
   * @param proxy - An existing proxy object
   * @returns An array of the proxy object's own property keys, including both strings and symbols
   */
  static keys(proxy: nx.Proxy): nx.ObjectKey[] {
    const { sandbox } = Nexo.wrap(proxy);
    if (sandbox) {
      return Reflect.ownKeys(sandbox);
    }
    return Reflect.ownKeys(proxy);
  }

  /**
   * Retrieves the prototype of a proxy, considering its sandbox target if applicable.
   *
   * @remarks
   * This method ensures that the prototype returned is the one from the sandbox target when the proxy was created without a direct target.
   *
   * @param proxy - An existing proxy object
   * @returns The prototype of the proxy, which can be an object or `null`
   */
  static getPrototypeOf(proxy: nx.Proxy): object {
    const { sandbox } = Nexo.wrap(proxy);
    if (sandbox) {
      return Reflect.getPrototypeOf(sandbox);
    }
    return Reflect.getPrototypeOf(proxy);
  }

  /**
   * Initializes the Nexo proxy system and event hooks.
   *
   * @remarks
   * Inherits all event management behavior from {@link NexoEmitter}.
   * Use `on()` and `emit()` to subscribe and react to internal proxy lifecycle events.
   */
  constructor() {
    super();
  }

  /**
   * Creates or retrieves an existing proxy by its unique ID.
   *
   * @remarks
   * If a proxy is already created with the provided ID, this method will return the existing proxy.
   * If a new proxy is requested with a different target, the method will create a new proxy associated with that target.
   * A `ProxyError` is thrown if an attempt is made to use the same ID for different targets.
   *
   * @example
   * // Creating or retrieving a proxy by its ID
   * const nexo = new Nexo();
   * const proxy = nexo.use('foo');
   * nexo.use('foo') === proxy; // True, retrieves the same proxy by ID
   *
   * @throws {@link ProxyError} - If the ID is already used by another proxy with a different target
   *
   * @param id - A unique identifier for the proxy
   * @param target - An optional target object to associate with the proxy
   * @returns A proxy uniquely associated with the provided ID and optional target.
   * Use this method to retrieve or memoize proxies tied to stable identifiers.
   */
  use(id: string, target?: nx.Traceable): nx.Proxy {
    if (!target && this.entries.has(id)) {
      // Returns an existing proxy by its ID
      return this.entries.get(id).deref();
    }

    // Create a new proxy for the target
    const proxy = getProxy(this, target, id);

    if (!this.entries.has(id)) {
      const { id: currentId } = Nexo.wrap(proxy);
      // Ensure ID cannot be changed for an existing target
      throw new ProxyError(
        `Cannot use '${id}' as the ID for the proxy because another proxy for the same target already exists with the ID '${currentId}'`,
        proxy,
      );
    }

    return proxy;
  }

  /**
   * Creates a new proxy object or retrieves an existing one with the specified target.
   *
   * @remarks
   * Proxies can be created with or without a target. If a target is provided, it will be used as the proxy target.
   * The method will emit a `proxy` event every time a new proxy is created.
   *
   * @example
   * // Creating a new proxy
   * const nexo = new Nexo();
   * const proxy = nexo.create();
   *
   * @param target - An optional target object for the proxy
   * @returns A new proxy object
   */
  create(target?: nx.Traceable): nx.Proxy {
    return getProxy(this, target);
  }
}

export default Nexo;
