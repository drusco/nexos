import type nx from "./types/Nexo.js";
import getProxy from "./utils/getProxy.js";
import NexoMap from "./utils/NexoMap.js";
import NexoEmitter from "./events/NexoEmitter.js";
import ProxyWrapper from "./utils/ProxyWrapper.js";
import maps from "./utils/maps.js";
import ProxyError from "./errors/ProxyError.js";

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
      return Reflect.getOwnPropertyDescriptor(sandbox, property);
    }
    return Reflect.getOwnPropertyDescriptor(proxy, property);
  }

  static keys(proxy: nx.Proxy): nx.objectKey[] {
    const { sandbox } = Nexo.wrap(proxy);
    if (sandbox) {
      return Reflect.ownKeys(sandbox);
    }
    return Reflect.ownKeys(proxy);
  }

  static getPrototypeOf(proxy: nx.Proxy): object {
    const { sandbox } = Nexo.wrap(proxy);
    if (sandbox) {
      return Reflect.getPrototypeOf(sandbox);
    }
    return Reflect.getPrototypeOf(proxy);
  }

  use(id: string, target?: nx.traceable): nx.Proxy {
    if (!target && this.entries.has(id)) {
      // returns an existing proxy by its id
      return this.entries.get(id).deref();
    }

    // get a new or existing proxy for the traceable target object
    const proxy = getProxy(this, target, id);

    if (this.entries.has(id)) {
      // update the existing entry id
      this.entries.set(id, new WeakRef(proxy));
    } else {
      const { id: currentId } = Nexo.wrap(proxy);
      // the id cannot be changed for an existing target
      throw new ProxyError(
        `Cannot use '${id}' as the ID for the proxy because another proxy for the same target already exists with the ID '${currentId}'`,
        proxy,
      );
    }

    return proxy;
  }

  create(target?: nx.traceable): nx.Proxy {
    return getProxy(this, target);
  }
}

export default Nexo;
