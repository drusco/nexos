import type nx from "./types/Nexo.js";
import getProxy from "./utils/getProxy.js";
import NexoMap from "./utils/NexoMap.js";
import NexoEmitter from "./events/NexoEmitter.js";
import ProxyWrapper from "./utils/ProxyWrapper.js";

class Nexo {
  readonly entries: NexoMap<nx.Proxy>;
  readonly events: NexoEmitter;

  constructor() {
    this.entries = new NexoMap();
    this.events = new NexoEmitter();
  }

  static fn(proxy: nx.Proxy): ProxyWrapper {
    return new ProxyWrapper(proxy);
  }

  use(id: string, target?: nx.traceable | void): nx.Proxy {
    if (!target && this.entries.has(id)) {
      // returns an existing proxy by its id
      return this.entries.get(id).deref();
    }

    // get a new or existing proxy for the target object
    const proxy = getProxy(this, target, id);

    // update the entry id
    if (this.entries.has(id)) {
      this.entries.set(id, new WeakRef(proxy));
    }

    return proxy;
  }

  create(target?: nx.traceable | void): nx.Proxy {
    return getProxy(this, target);
  }
}

export default Nexo;
