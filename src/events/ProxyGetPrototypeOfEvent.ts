import type * as nx from "../types/Nexo.js";
import ProxyEvent from "./ProxyEvent.js";
import map from "../utils/maps.js";

class ProxyGetPrototypeOfEvent
  extends ProxyEvent<nx.ProxyGetPrototypeOfEvent["data"]>
  implements nx.ProxyGetPrototypeOfEvent
{
  declare readonly data: nx.ProxyGetPrototypeOfEvent["data"];
  declare readonly returnValue: nx.ProxyGetPrototypeOfEvent["returnValue"];

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
    data: nx.ProxyGetPrototypeOfEvent["data"];
    target: nx.Proxy;
  }) {
    super("getPrototypeOf", options);

    // Retrieve the wrapper for the proxy
    const wrapper = map.proxies.get(options.target);
    // Emit the proxy event to its listeners on the 'nexo' emitter
    wrapper?.nexo?.emit("proxy.getPrototypeOf", this);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.emit("proxy.getPrototypeOf", this);
  }
}

export default ProxyGetPrototypeOfEvent;
