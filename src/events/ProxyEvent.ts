import type nx from "../types/Nexo.js";
import NexoEvent from "./NexoEvent.js";
import map from "../utils/maps.js";

class ProxyEvent<Data = unknown> extends NexoEvent<nx.Proxy, Data> {
  constructor(
    name: nx.proxy.handler,
    options: nx.events.options<nx.Proxy, Data>,
  ) {
    super(`proxy.${name}`, options);

    const { wrapper, nexo } = map.proxies.get(this.target);

    // Emit the proxy event to its listeners
    nexo.emit(this.name, this);
    wrapper.emit(this.name, this);
  }
}

export default ProxyEvent;
