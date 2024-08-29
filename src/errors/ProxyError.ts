import NexoEvent from "../events/NexoEvent.js";
import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";

class ProxyError extends Error {
  readonly proxy: nx.Proxy;

  constructor(message: string, proxy: nx.Proxy) {
    super(message);
    this.proxy = proxy;

    const { nexo, wrapper } = map.proxies.get(proxy);

    const event = new NexoEvent("proxy.error", { target: proxy, data: this });

    nexo.emit(event.name, event);
    wrapper.emit(event.name, event);
  }
}

export default ProxyError;
