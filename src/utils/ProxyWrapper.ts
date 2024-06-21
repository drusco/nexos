import type nx from "../types/Nexo.js";
import EventEmitter from "events";
import map from "./maps.js";

class ProxyWrapper extends EventEmitter {
  private get data() {
    const proxy = map.tracables.get(this);
    return map.proxies.get(proxy);
  }

  get id(): string | void {
    return this.data?.id;
  }

  get target(): nx.traceable | void {
    return this.data?.target;
  }
}

export default ProxyWrapper;
