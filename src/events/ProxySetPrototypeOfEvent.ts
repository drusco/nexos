import type * as nx from "../types/Nexo.js";
import ProxyEvent from "./ProxyEvent.js";
import getProxyMap from "../utils/getProxyMap.js";

class ProxySetPrototypeOfEvent
  extends ProxyEvent<nx.ProxySetPrototypeOfEvent["data"]>
  implements nx.ProxySetPrototypeOfEvent
{
  declare readonly data: nx.ProxySetPrototypeOfEvent["data"];
  declare readonly returnValue: nx.ProxySetPrototypeOfEvent["returnValue"];

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
    data: nx.ProxySetPrototypeOfEvent["data"];
    target: nx.Proxy;
  }) {
    super("setPrototypeOf", options);

    // Retrieve the wrapper for the proxy
    const wrapper = getProxyMap().get(options.target);
    // Emit the proxy event to its listeners on the 'nexo' emitter
    wrapper?.nexo?.emit("proxy.setPrototypeOf", this);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.events?.emit("proxy.setPrototypeOf", this);
  }
}

export default ProxySetPrototypeOfEvent;
