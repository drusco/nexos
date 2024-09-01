import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";

class ProxyError extends Error {
  readonly proxy: nx.Proxy;

  constructor(message: string, proxy: nx.Proxy) {
    super(message);
    this.proxy = proxy;

    const wrapper = map.proxies.get(proxy);

    wrapper.nexo.emit("proxy.error", this);
    wrapper.emit("proxy.error", this);
  }
}

export default ProxyError;
