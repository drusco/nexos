import type * as nx from "../types/Nexo.js";
import ProxyEvent from "./ProxyEvent.js";
import map from "../utils/maps.js";

class ProxyDefinePropertyEvent
  extends ProxyEvent<nx.ProxyDefinePropertyEvent["data"]>
  implements nx.ProxyDefinePropertyEvent
{
  declare readonly data: nx.ProxyDefinePropertyEvent["data"];
  declare readonly returnValue: nx.ProxyDefinePropertyEvent["returnValue"];

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
    data: nx.ProxyDefinePropertyEvent["data"];
    target: nx.Proxy;
  }) {
    super("defineProperty", options);

    // Retrieve the wrapper for the proxy
    const wrapper = map.proxies.get(options.target);
    // Emit the proxy event to its listeners on the 'nexo' emitter
    wrapper?.nexo?.emit("proxy.defineProperty", this);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.emit("proxy.defineProperty", this);
  }
}

export default ProxyDefinePropertyEvent;
