import type * as nx from "../types/Nexo.js";
import NexoEvent from "./NexoEvent.js";
import map from "../utils/maps.js";

/**
 * Represents an event triggered by a proxy.
 * This class extends `NexoEvent` and adds functionality to emit the event to listeners
 * associated with the proxy's `nexo` and wrapper event emitters.
 *
 * @template Data - The type of the event's data.
 *
 * @example
 * const proxyEvent = new ProxyEvent('get', { target: someProxyInstance, data: someData });
 * // This will emit the 'proxy.get' event to listeners.
 */
class ProxyEvent<Data = unknown>
  extends NexoEvent<nx.Proxy, Data>
  implements nx.ProxyEvent<Data>
{
  /**
   * Creates an instance of the `ProxyEvent`.
   * This constructor initializes the event with the name prefixed by `proxy.` and emits the event
   * on the proxy's associated event emitters.
   *
   * @param name - The name of the proxy handler (e.g., 'get', 'set').
   * @param options - The options for the event, including the `target` proxy and any associated data.
   *
   * @example
   * const proxyEvent = new ProxyEvent('get', { target: someProxyInstance, data: someData });
   * // This emits the 'proxy.get' event on the proxy's `nexo` emitter and its wrapper.
   */
  constructor(
    name: nx.ProxyHandler,
    options: Partial<{
      data: Data;
      target: nx.Proxy;
      cancelable: boolean;
    }> = {},
  ) {
    super(`proxy.${name}`, options);

    // Retrieve the wrapper for the proxy and emit the event
    const wrapper = map.proxies.get(this.target);

    // Emit the proxy event to its listeners on the 'nexo' emitter
    wrapper?.nexo?.emit(this.name, this);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.emit(this.name, this);
  }
}

export default ProxyEvent;
