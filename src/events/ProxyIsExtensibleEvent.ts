import ProxyEvent from "./ProxyEvent.js";
import getProxyWrapper from "../utils/getProxyWrapper.js";

class ProxyIsExtensibleEvent
  extends ProxyEvent<nx.ProxyIsExtensibleEvent["data"]>
  implements nx.ProxyIsExtensibleEvent
{
  declare readonly data: nx.ProxyIsExtensibleEvent["data"];
  declare readonly returnValue: nx.ProxyIsExtensibleEvent["returnValue"];

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
    data: nx.ProxyIsExtensibleEvent["data"];
    target: nx.Proxy;
  }) {
    super("isExtensible", options);

    // Retrieve the wrapper for the proxy
    const wrapper = getProxyWrapper(options.target);
    // Emit the proxy event to its listeners on the 'nexo' emitter
    wrapper?.nexo?.events?.emit("proxy.isExtensible", this);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.events?.emit("proxy.isExtensible", this);
  }
}

export default ProxyIsExtensibleEvent;
