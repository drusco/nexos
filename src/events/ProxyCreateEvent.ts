import type * as nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import NexoEvent from "./NexoEvent.js";

class ProxyCreateEvent
  extends NexoEvent<nx.Proxy, nx.ProxyCreateEvent["data"]>
  implements nx.ProxyCreateEvent
{
  declare readonly data: nx.ProxyCreateEvent["data"];
  declare readonly returnValue: nx.ProxyCreateEvent["returnValue"];

  /**
   * This constructor initializes the event and emits the event
   * on the proxy's associated event emitters.
   *
   * @param options - Options to configure the event.
   * @param options.data - The data associated with the event.
   * @param options.target - The proxy of the event.
   *
   */
  constructor(options: {
    data: nx.ProxyCreateEvent["data"];
    target: nx.Proxy;
  }) {
    super("proxy", options);

    // Retrieve the wrapper for the proxy
    const wrapper = map.proxies.get(options.target);
    // Emit the proxy event to its listeners on the 'nexo' emitter
    wrapper?.nexo?.emit("proxy", this);
  }
}

export default ProxyCreateEvent;
