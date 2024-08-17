import type nx from "../types/Nexo.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";
import NexoEvent from "./NexoEvent.js";

class ProxyEvent<Data = unknown> extends NexoEvent<nx.Proxy, Data> {
  constructor(
    name: nx.proxy.handler,
    options: nx.events.options<nx.Proxy, Data>,
  ) {
    super(`nx.proxy.${name}`, options);
    const proxy = this.target;
    const { nexo, events } = new ProxyWrapper(proxy);
    nexo.events.emit(this.name, this);
    events.emit(this.name, this);
  }
}

export default ProxyEvent;
