import type * as nx from "../types/Nexo.js";
import NexoEvent from "./NexoEvent.js";
import map from "../utils/maps.js";

class ProxyEvent<Data = unknown> extends NexoEvent<nx.Proxy, Data> {
  constructor(name: nx.ProxyHandler, options: nx.Event<nx.Proxy, Data>) {
    super(`proxy.${name}`, options);

    const wrapper = map.proxies.get(this.target);

    // Emit the proxy event to its listeners
    wrapper.nexo.emit(this.name, this);
    wrapper.emit(this.name, this);
  }
}

export default ProxyEvent;
