import NexoTS from "./types/Nexo.js";
import { getProxy } from "../utils/index.js";
import map from "./maps.js";
import NexoMap from "./NexoMap.js";
import EventEmitter from "events";

class Nexo extends EventEmitter {
  readonly entries: NexoMap<NexoTS.Proxy>;

  constructor() {
    super();
    this.entries = new NexoMap();
  }

  static getProxyId(proxy: NexoTS.Proxy): void | string {
    const data = map.proxies.get(proxy);

    return data?.id;
  }

  static getProxyTarget(proxy: NexoTS.Proxy): void | NexoTS.traceable {
    const data = map.proxies.get(proxy);

    if (data?.target) {
      return data.target.deref();
    }
  }

  static mock(proxy: NexoTS.Proxy): void | NexoTS.Mock {
    const data = map.proxies.get(proxy);

    if (data?.mock) {
      return data.mock.deref();
    }
  }

  use(id: string, target?: NexoTS.traceable | void): NexoTS.Proxy {
    if (this.entries.has(id)) {
      // returns an existing proxy by its id
      return this.entries.get(id).deref();
    }

    // creates a new proxy using a custom name
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
