import EventEmitter from "events";
import map from "./maps.js";
import Nexo from "./types/Nexo.js";

class ProxyWrapper extends EventEmitter {
  private get data() {
    const proxy = map.tracables.get(this);
    return map.proxies.get(proxy);
  }

  get id(): string {
    return this.data.id;
  }

  get target(): void | Nexo.traceable {
    return this.data.target;
  }
}

export default ProxyWrapper;
