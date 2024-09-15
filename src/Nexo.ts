import type nx from "./types/Nexo.js";
import getProxy from "./utils/getProxy.js";
import NexoMap from "./utils/NexoMap.js";
import NexoEmitter from "./events/NexoEmitter.js";
import ProxyWrapper from "./utils/ProxyWrapper.js";
import maps from "./utils/maps.js";
import ProxyError from "./errors/ProxyError.js";

/**
 * Represents a proxy factory.
 *
 * @remarks
 * This class is used to easily create and access proxy objects.
 * It emits the following events: 'proxy', 'error', 'proxy.{@link types.proxy.handler | handlerName}', 'proxy.error'.
 *
 * @example
 * Accesing the 'proxy' {@link NexoEvent} every time a new proxy is created.
 *
 * ```ts
 * const nexo = new Nexo();
 * const listener = (event: NexoEvent) => {};
 *
 * nexo.on('proxy', listener);
 *
 * // listener will be called
 * const proxy = nexo.create()
 * ```
 *
 */
class Nexo extends NexoEmitter {
  /**
   * A map of unique proxy IDs that holds {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef | WeakRef} references to the proxy objects.
   */
  readonly entries: NexoMap<nx.Proxy> = new NexoMap();

  /**
   * Returns a proxy wrapper.
   *
   * @remarks
   * This method allows to interact with the proxy object.
   *
   * @example
   * Accessing a {@link ProxyEvent}.
   * Each proxy event follows the naming convention 'proxy.{@link types.proxy.handler | handlerName}',
   * where {@link types.proxy.handler | handlerName} corresponds to one of the standard handler functions specified in the
   * [MDN Proxy API documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy).
   * For example, events such as 'proxy.apply', 'proxy.construct',
   * and others will be emitted when the corresponding handler functions ('apply', 'construct', etc.) are invoked.
   *
   * ```ts
   * const nexo = new Nexo();
   * const proxy = nexo.create();
   * const wrapper = Nexo.wrap(proxy);
   *
   * wrapper.on('proxy.get', (event: ProxyEvent) => {})
   * ```
   *
   * @param proxy - An existing proxy object
   * @returns A wrapper for the proxy
   *
   */
  static wrap(proxy: nx.Proxy): ProxyWrapper {
    return maps.proxies.get(proxy);
  }

  /**
   * When working with proxies that were created without targets,
   * their property descriptors are retrieved from a sandbox target instead
   *
   * @remarks
   * When using Reflect.getOwnPropertyDescriptor on a proxy,
   * the returned value may differ from the real property descriptor due to how proxies work.
   * Nexo.getOwnPropertyDescriptor, however, reveals the actual descriptor from the sandbox target.
   *
   * @param proxy - An existing proxy object
   * @returns A property descriptor of the given property if it exists on the proxy, undefined otherwise.
   *
   */
  static getOwnPropertyDescriptor(
    proxy: nx.Proxy,
    property: nx.objectKey,
  ): void | PropertyDescriptor {
    const { sandbox } = Nexo.wrap(proxy);
    if (sandbox) {
      return Reflect.getOwnPropertyDescriptor(sandbox, property);
    }
    return Reflect.getOwnPropertyDescriptor(proxy, property);
  }

  /**
   * When working with proxies that were created without targets,
   * their own keys are retrieved from a sandbox target instead
   *
   * @remarks
   * When using Reflect.ownKeys on a proxy,
   * the returned value may differ from the real keys due to how proxies work.
   * Nexo.keys, however, reveals the actual keys from the sandbox target.
   *
   * @param proxy - An existing proxy object
   * @returns An Array of the proxy object's own property keys, including strings and symbols
   *
   */
  static keys(proxy: nx.Proxy): nx.objectKey[] {
    const { sandbox } = Nexo.wrap(proxy);
    if (sandbox) {
      return Reflect.ownKeys(sandbox);
    }
    return Reflect.ownKeys(proxy);
  }

  /**
   * When working with proxies that were created without targets,
   * their prototypes are retrieved from a sandbox target instead
   *
   * @remarks
   * When using Reflect.getPrototypeOf on a proxy,
   * the returned value may differ from the real prototype due to how proxies work.
   * Nexo.getPrototypeOf, however, reveals the actual prototype from the sandbox target.
   *
   * @param proxy - An existing proxy object
   * @returns The prototype of the given proxy, which may be an object or null.
   *
   */
  static getPrototypeOf(proxy: nx.Proxy): object {
    const { sandbox } = Nexo.wrap(proxy);
    if (sandbox) {
      return Reflect.getPrototypeOf(sandbox);
    }
    return Reflect.getPrototypeOf(proxy);
  }

  /**
   * Allows creating or retrieving an existing proxy using its unique ID.
   *
   * @remarks
   * Proxies can be created with or without a target.
   * This method lets you create proxies that can later be accessed by their unique ID.
   * Creating a new proxy with an existing ID and a different target will fail.
   * {@link Nexo} and {@link ProxyWrapper} emit a 'proxy' {@link NexoEvent} every time a new proxy is created.
   *
   * @example
   * ```ts
   * const nexo = new Nexo();
   * const proxy = nexo.use('foo');
   * nexo.use('foo') === proxy;
   * ```
   *
   * @throws {@link ProxyError}
   * This exception is thrown when the ID is already being used by another proxy with a different target.
   *
   * @param id - A unique id that will represent the proxy
   * @param target - An optional object that will be used as the proxy target
   * @returns A proxy that can be accessed by its id
   *
   */
  use(id: string, target?: nx.traceable): nx.Proxy {
    if (!target && this.entries.has(id)) {
      // returns an existing proxy by its id
      return this.entries.get(id).deref();
    }

    // get a new or existing proxy for the traceable target object
    const proxy = getProxy(this, target, id);

    if (!this.entries.has(id)) {
      const { id: currentId } = Nexo.wrap(proxy);
      // the id cannot be changed for an existing target
      throw new ProxyError(
        `Cannot use '${id}' as the ID for the proxy because another proxy for the same target already exists with the ID '${currentId}'`,
        proxy,
      );
    }

    return proxy;
  }

  /**
   * Allows to create new proxy objects.
   *
   * @remarks
   * Proxies can be created with or without a target.
   * {@link Nexo} and {@link ProxyWrapper} emit a 'proxy' {@link NexoEvent} every time a new proxy is created.
   *
   * @example
   * ```ts
   * const nexo = new Nexo();
   * const proxy = nexo.create();
   * ```
   *
   * @param target - An optional object that will be used as the proxy target
   * @returns A new proxy object
   *
   */
  create(target?: nx.traceable): nx.Proxy {
    return getProxy(this, target);
  }
}

export default Nexo;
