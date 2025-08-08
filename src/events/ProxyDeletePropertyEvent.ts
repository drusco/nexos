import type * as nx from "../types/Nexo.js";
import ProxyEvent from "./ProxyEvent.js";
import map from "../utils/maps.js";

class ProxyDeletePropertyEvent
  extends ProxyEvent<nx.ProxyDeletePropertyEvent["data"]>
  implements nx.ProxyDeletePropertyEvent
{
  declare readonly data: nx.ProxyDeletePropertyEvent["data"];
  declare readonly returnValue: nx.ProxyDeletePropertyEvent["returnValue"];

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
    data: nx.ProxyDeletePropertyEvent["data"];
    target: nx.Proxy;
  }) {
    super("deleteProperty", options);

    // Retrieve the wrapper for the proxy
    const wrapper = map.proxies.get(options.target);
    // Emit the proxy event to its listeners on the 'nexo' emitter
    wrapper?.nexo?.emit("proxy.deleteProperty", this);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.emit("proxy.deleteProperty", this);
  }
}

export default ProxyDeletePropertyEvent;
