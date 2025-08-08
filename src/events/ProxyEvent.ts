import type * as nx from "../types/Nexo.js";
import NexoEvent from "./NexoEvent.js";
import map from "../utils/maps.js";

/**
 * Represents an event triggered by a proxy.
 */
class ProxyEvent<Data = unknown>
  extends NexoEvent<nx.Proxy, Data>
  implements nx.ProxyEvent<Data>
{
  declare readonly cancelable: true;

  /**
   * Creates an instance of the `ProxyEvent`.
   * This constructor initializes the event with the name prefixed by `proxy.`
   *
   * @param name - The name of the proxy handler (e.g., 'get', 'set').
   * @param options - Options to configure the event (e.g., `data`, `target`, `cancelable`).
   * @param options.data - The data associated with the event.
   * @param options.target - The proxy of the event.
   *
   * @example
   * const proxyEvent = new ProxyEvent('get', { target: proxy, data: "example" });
   */
  constructor(
    name: nx.ProxyHandler,
    options: {
      data?: Data;
      target: nx.Proxy;
    } = undefined,
  ) {
    if (!map.proxies.has(options?.target)) {
      throw TypeError("options.target is not a valid proxy.");
    }
    super(`proxy.${name}`, { ...options, cancelable: true });
  }
}

export default ProxyEvent;
