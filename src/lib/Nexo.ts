import NexoTS from "./types/Nexo.js";
import { findProxy, getProxy, isTraceable } from "../utils/index.js";
import map from "./maps.js";
import NexoMap from "./NexoMap.js";
import EventEmitter from "events";
import NexoEvent from "./events/NexoEvent.js";

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
    const usableProxy = findProxy(target);

    if (usableProxy) {
      return usableProxy;
    }

    const proxy = getProxy(this, target);
    const proxyId = Nexo.getProxyId(proxy);
    const proxyTarget = Nexo.getProxyTarget(proxy);

    const event = new NexoEvent("nx.proxy.create", this, {
      id: proxyId,
      target: proxyTarget,
    });

    this.entries.set(proxyId, new WeakRef(proxy));
    this.emit(event.name, event);

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
