import type nx from "./types/Nexo.js";
import getProxy from "./utils/getProxy.js";
import NexoMap from "./utils/NexoMap.js";
import NexoEmitter from "./events/NexoEmitter.js";
import ProxyWrapper from "./utils/ProxyWrapper.js";
import findProxy from "./utils/findProxy.js";
import maps from "./utils/maps.js";

class Nexo extends NexoEmitter {
  readonly entries: NexoMap<nx.Proxy> = new NexoMap();

  static wrap(traceable: nx.traceable): void | ProxyWrapper {
    const proxy = findProxy(traceable);
    if (proxy) {
      return maps.proxies.get(proxy);
    }
  }

  use(id: string, target?: undefined): nx.Proxy;
  use<T extends nx.traceable>(id: string, target?: T): T;
  use<T extends nx.traceable>(id: string, target?: T): T | nx.Proxy {
    if (!target && this.entries.has(id)) {
      // returns an existing proxy by its id
      return this.entries.get(id).deref();
    }

    // get a new or existing proxy for the target object
    const proxy = getProxy(this, target, id) as nx.Proxy;

    // update the entry id
    if (this.entries.has(id)) {
      this.entries.set(id, new WeakRef(proxy));
    }

    return proxy;
  }

  create(target?: undefined): nx.Proxy;
  create<T extends nx.traceable>(target?: T): T;
  create<T extends nx.traceable>(target?: T): T | nx.Proxy {
    return getProxy(this, target);
  }
}

export default Nexo;
