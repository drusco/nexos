import NexoTS from "./types/Nexo.js";
import getProxy from "../utils/getProxy.js";
import map from "./maps.js";
import NexoMap from "./NexoMap.js";
import EventEmitter from "events";
class Nexo extends EventEmitter {
  readonly entries: NexoMap<NexoTS.Proxy>;

  constructor() {
    super();
    this.entries = new NexoMap();
  }

  static wrap(proxy: NexoTS.Proxy): NexoTS.Wrapper {
    const { wrapper } = map.proxies.get(proxy);
    return wrapper.deref();
  }

  use(id: string, target?: NexoTS.traceable | void): NexoTS.Proxy {
    if (!target && this.entries.has(id)) {
      // returns an existing proxy by its id
      return this.entries.get(id).deref();
    }

    // creates or update an entry key to a proxy
    const proxy = getProxy(this, target, id);
    this.entries.set(id, new WeakRef(proxy));

    return proxy;
  }

  proxy(target?: NexoTS.traceable | void): NexoTS.Proxy {
    if (!target) {
      return getProxy(this);
    }

    return getProxy(this, target);
  }
}

export default Nexo;
