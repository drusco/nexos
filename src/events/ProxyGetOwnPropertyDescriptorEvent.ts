import type * as nx from "../types/Nexo.js";
import ProxyEvent from "./ProxyEvent.js";
import map from "../utils/maps.js";

class ProxyGetOwnPropertyDescriptorEvent
  extends ProxyEvent<nx.ProxyGetOwnPropertyDescriptorEvent["data"]>
  implements nx.ProxyGetOwnPropertyDescriptorEvent
{
  declare readonly data: nx.ProxyGetOwnPropertyDescriptorEvent["data"];
  declare readonly returnValue: void | PropertyDescriptor;

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
    data: nx.ProxyGetOwnPropertyDescriptorEvent["data"];
    target: nx.Proxy;
  }) {
    super("getOwnPropertyDescriptor", options);

    // Retrieve the wrapper for the proxy
    const wrapper = map.proxies.get(options.target);
    // Emit the proxy event to its listeners on the 'nexo' emitter
    wrapper?.nexo?.emit("proxy.getOwnPropertyDescriptor", this);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.emit("proxy.getOwnPropertyDescriptor", this);
  }
}

export default ProxyGetOwnPropertyDescriptorEvent;
