import type nx from "../types/Nexo.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";
import NexoEvent from "./NexoEvent.js";

class ProxyEvent<Data = unknown> extends NexoEvent<nx.Proxy, Data> {
  constructor(
    name: nx.proxy.handler,
    options: nx.events.options<nx.Proxy, Data>,
  ) {
    super(`nx.proxy.${name}`, options);

    const wrapper = new ProxyWrapper(this.target);

    // Emit the proxy event to its listeners
    wrapper.nexo.emit(this.name, this);
    wrapper.events.emit(this.name, this);
  }
}

export default ProxyEvent;
