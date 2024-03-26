import NexoTS from "./types/Nexo.js";
import { getProxy, isTraceable } from "../utils/index.js";
import map from "./maps.js";
import NexoMap from "./NexoMap.js";
import EventEmitter from "events";

class Nexo extends EventEmitter {
  readonly entries: NexoMap<NexoTS.Proxy>;

  constructor() {
    super();
    this.entries = new NexoMap();
  }

  static getProxyId(proxy: NexoTS.Proxy): string {
    const data = map.proxies.get(proxy);
    return data.id;
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

  proxy(target?: string | NexoTS.traceable): NexoTS.Proxy {
    if (isTraceable(target)) {
      return getProxy(this, target);
    }

    if (this.entries.has(target)) {
      // returns an existing proxy by its id or name
      return this.entries.get(target).deref();
    }

    // creates a new proxy using a custom name
    const proxy = getProxy(this);
    this.entries.set(target, new WeakRef(proxy));

    return proxy;
  }
}

export default Nexo;
