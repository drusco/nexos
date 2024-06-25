import type nx from "./types/Nexo.js";
import getProxy from "./utils/getProxy.js";
import NexoMap from "./utils/NexoMap.js";
import EventEmitter from "events";

class Nexo {
  readonly entries: NexoMap<nx.Proxy>;
  readonly events: EventEmitter;

  constructor() {
    this.entries = new NexoMap();
    this.events = new EventEmitter();
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
