import type nx from "./types/Nexo.js";
import getProxy from "./utils/getProxy.js";
import NexoMap from "./utils/NexoMap.js";
import NexoEmitter from "./events/NexoEmitter.js";
import ProxyWrapper from "./utils/ProxyWrapper.js";
import maps from "./utils/maps.js";

class Nexo extends NexoEmitter {
  readonly entries: NexoMap<nx.Proxy> = new NexoMap();

  static wrap(proxy: nx.Proxy): ProxyWrapper {
    return maps.proxies.get(proxy);
  }

  static getOwnPropertyDescriptor(
    proxy: nx.Proxy,
    property: nx.objectKey,
  ): void | PropertyDescriptor {
    const { sandbox } = Nexo.wrap(proxy);
    if (sandbox) {
      return Object.getOwnPropertyDescriptor(sandbox, property);
    }
    return Object.getOwnPropertyDescriptor(proxy, property);
  }

  static keys(proxy: nx.Proxy): nx.objectKey[] {
    const { sandbox } = Nexo.wrap(proxy);
    if (sandbox) {
      return Object.keys(sandbox);
    }
    return Object.keys(proxy);
  }

  use(id: string, target?: nx.traceable): nx.Proxy {
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

  create(target?: nx.traceable): nx.Proxy {
    return getProxy(this, target);
  }
}

export default Nexo;
