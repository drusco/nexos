import type nx from "../types/Nexo.js";
import EventEmitter from "events";
import map from "./maps.js";

class ProxyWrapper {
  readonly proxy: nx.Proxy;

  constructor(proxy: nx.Proxy) {
    this.proxy = proxy;
  }

  private get data(): nx.proxy.data {
    return map.proxies.get(this.proxy);
  }

  get id(): string {
    return this.data.id;
  }

  get target(): nx.traceable | void {
    return this.data.target;
  }

  get events(): EventEmitter {
    return this.data.events;
  }

  get fn(): nx.functionLike {
    return this.data.fn;
  }
}

export default ProxyWrapper;
