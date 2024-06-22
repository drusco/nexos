import type nx from "./types/Nexo.js";
import getProxy from "./utils/getProxy.js";
import NexoMap from "./utils/NexoMap.js";
import EventEmitter from "events";
import ProxyWrapper from "./utils/ProxyWrapper.js";

class Nexo extends EventEmitter {
  readonly entries: NexoMap<nx.Proxy>;

  constructor() {
    super();
    this.entries = new NexoMap();
  }

  static wrap(proxy: nx.Proxy): ProxyWrapper {
    return new ProxyWrapper(proxy);
  }

  use(id: string, target?: nx.traceable | void): nx.Proxy {
    if (!target && this.entries.has(id)) {
      // returns an existing proxy by its id
      return this.entries.get(id).deref();
    }

    // sets an entry key for a proxy
    const proxy = getProxy(this, target, id);
    this.entries.set(id, new WeakRef(proxy));

    return proxy;
  }

  proxy(target?: nx.traceable | void): nx.Proxy {
    return getProxy(this, target);
  }
}

export default Nexo;
