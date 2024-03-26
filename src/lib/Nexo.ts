import NexoTS from "./types/Nexo.js";
import { getProxy, isTraceable } from "../utils/index.js";
import map from "./maps.js";
import NexoMap from "./NexoMap.js";
import EventEmitter from "events";

class Nexo extends EventEmitter {
  readonly entries: NexoMap<NexoTS.Proxy>;
  readonly links: NexoMap<NexoTS.Proxy>;

  constructor() {
    super();

    this.entries = new NexoMap();
    this.links = new NexoMap();
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

  createProxy(target?: NexoTS.traceable): NexoTS.Proxy {
    const proxy = getProxy(this, target);

    return proxy;
  }

  use(target: string | NexoTS.traceable): NexoTS.Proxy {
    if (isTraceable(target)) {
      return this.createProxy(target);
    }

    if (this.links.has(target)) {
      return this.links.get(target).deref();
    }

    const proxy = this.createProxy();
    this.links.set(target, new WeakRef(proxy));

    return proxy;
  }
}

export default Nexo;
