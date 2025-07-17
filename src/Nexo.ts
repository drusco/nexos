import type * as nx from "./types/Nexo.js";
import getProxy from "./utils/getProxy.js";
import NexoMap from "./utils/NexoMap.js";
import NexoEmitter from "./events/NexoEmitter.js";
import maps from "./utils/maps.js";
import ProxyError from "./errors/ProxyError.js";

/**
 * Represents a proxy factory for creating and managing proxy objects.
 *
 * @remarks
 * This class provides utilities for creating proxies, retrieving existing ones by unique IDs, and interacting with them through event-driven mechanisms.
 *
 * It emits the following events:
 * - `proxy`: Fired whenever a new proxy is created.
 * - `error`: Fired when an error occurs.
 * - `proxy.handler`: Fired when any proxy **{@link nx.ProxyHandler | handler}** function is invoked.
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
class Nexo extends NexoEmitter implements nx.Nexo {
  /**
   * A map that stores unique proxy IDs associated with their respective {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef | WeakRef} references to the proxy objects.
   *
   * @remarks
   * This map allows quick access to proxies by their unique ID, ensuring that proxies are properly managed and referenced.
   */
  readonly entries: nx.NexoMap<nx.Proxy> = new NexoMap();

  /**
   * Determines whether the given value is a registered {@link nx.Proxy | Proxy} instance.
   *
   * This function checks if the value exists in the internal proxy map,
   * meaning it was previously registered as a proxy via the system.
   *
   * Acts as a type guard for narrowing `unknown` to {@link nx.Proxy | Proxy}.
   *
   * @param value - The value to check.
   * @returns `true` if the value is a known {@link nx.Proxy | Proxy}, otherwise `false`.
   */
  static isProxy(value: unknown): value is nx.Proxy {
    return maps.proxies.has(value as nx.Proxy);
  }

  /**
   * Determines whether the given value is a {@link nx.Traceable | Traceable} entity.
   *
   * A value is considered traceable if it is a non-null object or function.
   * This check is used to determine whether the value is eligible to be
   * linked to a proxy in the system's internal tracking.
   *
   * Acts as a type guard to narrow the type to {@link nx.Traceable | Traceable}.
   *
   * @param value - The value to evaluate.
   * @returns `true` if the value is {@link nx.Traceable | Traceable}, otherwise `false`.
   */
  static isTraceable(value: unknown): value is nx.Traceable {
    const isObject = typeof value === "object";
    const isFunction = typeof value === "function";

    if (!isObject && !isFunction) return false;
    if (value === null) return false;

    return true;
  }

  /**
   * Provides a wrapper for an existing proxy.
   *
   * @remarks
   * This method wraps a proxy object and allows interaction with the proxy's events and properties.
   * Proxy-related events follow the format `proxy.handler`, where the **{@link nx.ProxyHandler | handler}** corresponds to one of the standard proxy handler functions such as `apply`, `construct`, `get`, etc.
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
   * @throws Error if the wrapper cannot be found.
   */
  static wrap(proxy: nx.Proxy): nx.ProxyWrapper {
    const wrapper = maps.proxies.get(proxy);

    if (!wrapper) {
      throw new ProxyError(`No wrapper found for the proxy.`, proxy);
    }
    return wrapper;
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
  static ownKeys(proxy: nx.Proxy): nx.ObjectKey[] {
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

  use(id: string, target?: nx.Traceable): nx.Proxy {
    return getProxy(this, target, id);
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
  create(target?: nx.Traceable): nx.Proxy {
    return getProxy(this, target);
  }
}

export default Nexo;
