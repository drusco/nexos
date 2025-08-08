import type * as nx from "../types/Nexo.js";
import ProxyEvent from "./ProxyEvent.js";
import map from "../utils/maps.js";

class ProxyGetEvent
  extends ProxyEvent<nx.ProxyGetEvent["data"]>
  implements nx.ProxyGetEvent
{
  declare readonly data: nx.ProxyGetEvent["data"];
  declare readonly returnValue: nx.ProxyGetEvent["returnValue"];

  /**
   * This constructor initializes the event and emits the event
   * on the proxy's associated event emitters.
   *
   * @param options - Options to configure the event (e.g., `data`, `target`).
   * @param options.data - The data associated with the event.
   * @param options.target - The proxy of the event.
   *
   */
  constructor(options: { data: nx.ProxyGetEvent["data"]; target: nx.Proxy }) {
    super("get", options);

    // Retrieve the wrapper for the proxy
    const wrapper = map.proxies.get(options.target);
    // Emit the proxy event to its listeners on the 'nexo' emitter
    wrapper?.nexo?.emit("proxy.get", this);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.emit("proxy.get", this);
  }
}

export default ProxyGetEvent;
