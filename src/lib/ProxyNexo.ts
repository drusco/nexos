import NexoTS from "./types/Nexo.js";
import Nexo from "./Nexo.js";
import { getProxy, isTraceable } from "../utils/index.js";
import map from "./maps.js";

class ProxyNexo extends Nexo<NexoTS.Proxy> {
  constructor() {
    super();
  }

  static getProxyId(proxy: NexoTS.Proxy): string {
    const { id } = map.proxies.get(proxy);
    return id;
  }

  static getProxyTarget(proxy: NexoTS.Proxy): void | NexoTS.traceable {
    const data = map.proxies.get(proxy);
    if (data?.target) return data.target.deref();
  }

  static mock(proxy: NexoTS.Proxy): void | NexoTS.Mock {
    const data = map.proxies.get(proxy);
    if (data?.mock) return data.mock.deref();
  }

  createProxy(target?: NexoTS.traceable): NexoTS.Proxy {
    return getProxy(this, target);
  }

  use(target: string | NexoTS.traceable): NexoTS.Proxy {
    if (isTraceable(target)) {
      return getProxy(this, target);
    }

    if (this.links.has(target)) {
      return this.links.get(target).deref();
    }

    return this.link(target);
  }

  link(name: string, target?: NexoTS.traceable): NexoTS.Proxy {
    const proxy = getProxy(this, target);
    return super.link(name, proxy);
  }
}

export default ProxyNexo;
