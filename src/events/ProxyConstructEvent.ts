import type * as nx from "../types/Nexo.js";
import ProxyEvent from "./ProxyEvent.js";
import map from "../utils/maps.js";

class ProxyConstructEvent
  extends ProxyEvent<nx.ProxyConstructEvent["data"]>
  implements nx.ProxyConstructEvent
{
  declare readonly data: nx.ProxyConstructEvent["data"];
  declare readonly returnValue: nx.ProxyConstructEvent["returnValue"];

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
    data: nx.ProxyConstructEvent["data"];
    target: nx.Proxy;
  }) {
    super("construct", options);

    // Retrieve the wrapper for the proxy
    const wrapper = map.proxies.get(options.target);
    // Emit the proxy event to its listeners on the 'nexo' emitter
    wrapper?.nexo?.emit("proxy.construct", this);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.emit("proxy.construct", this);
  }
}

export default ProxyConstructEvent;
