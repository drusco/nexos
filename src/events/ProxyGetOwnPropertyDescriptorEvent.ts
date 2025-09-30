import ProxyEvent from "./ProxyEvent.js";
import getProxyWrapper from "../utils/getProxyWrapper.js";

class ProxyGetOwnPropertyDescriptorEvent
  extends ProxyEvent<nx.ProxyGetOwnPropertyDescriptorEvent["data"]>
  implements nx.ProxyGetOwnPropertyDescriptorEvent
{
  declare readonly data: nx.ProxyGetOwnPropertyDescriptorEvent["data"];
  declare readonly returnValue: PropertyDescriptor;

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
    data: nx.ProxyGetOwnPropertyDescriptorEvent["data"];
    target: nx.Proxy;
  }) {
    super("getOwnPropertyDescriptor", options);

    // Retrieve the wrapper for the proxy
    const wrapper = getProxyWrapper(options.target);
    // Emit the proxy event to its listeners on the 'nexo' emitter
    wrapper?.nexo?.events?.emit("proxy.getOwnPropertyDescriptor", this);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.events?.emit("proxy.getOwnPropertyDescriptor", this);
  }
}

export default ProxyGetOwnPropertyDescriptorEvent;
