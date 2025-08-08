import type * as nx from "../types/Nexo.js";
import ProxyEvent from "./ProxyEvent.js";
import map from "../utils/maps.js";

class ProxyOwnKeysEvent
  extends ProxyEvent<nx.ProxyOwnKeysEvent["data"]>
  implements nx.ProxyOwnKeysEvent
{
  declare readonly data: nx.ProxyOwnKeysEvent["data"];
  declare readonly returnValue: nx.ProxyOwnKeysEvent["returnValue"];

  /**
   * This constructor initializes the event and emits the event
   * on the proxy's associated event emitters.
   *
   * @param options - Options to configure the event (e.g., `data`, `target`).
   * @param options.data - The data associated with the event.
   * @param options.target - The proxy of the event.
   *
   */
  constructor(options: {
    data: nx.ProxyOwnKeysEvent["data"];
    target: nx.Proxy;
  }) {
    super("ownKeys", options);

    // Retrieve the wrapper for the proxy
    const wrapper = map.proxies.get(options.target);
    // Emit the proxy event to its listeners on the 'nexo' emitter
    wrapper?.nexo?.emit("proxy.ownKeys", this);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.emit("proxy.ownKeys", this);
  }
}

export default ProxyOwnKeysEvent;
