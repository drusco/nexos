import NexoTS from "./types/Nexo.js";
import EventEmitter from "node:events";
import { getProxy, isTraceable } from "../utils/index.js";
import map from "./maps.js";

export default class Nexo extends EventEmitter {
  protected options: NexoTS.options = {};
  readonly proxies: NexoTS.proxy.map = new Map();
  readonly links: NexoTS.proxy.map = new Map();

  constructor(options?: NexoTS.options) {
    super();

    if (options) {
      this.options = { ...this.options, ...options };
    }
  }

  create(target?: NexoTS.traceable): NexoTS.Proxy {
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

    this.links.set(name, new WeakRef(proxy));
    this.emit("nx.link", name, proxy);

    return proxy;
  }

  unlink(name: string): boolean {
    this.emit("nx.unlink", name);
    return this.links.delete(name);
  }

  target(proxy: NexoTS.Proxy): NexoTS.traceable | void {
    const data = map.proxies.get(proxy);

    if (!data) return;

    if (data.target) {
      return data.target.deref();
    }

    return;
  }

  mock(proxy: NexoTS.Proxy): NexoTS.Mock | void {
    const data = map.proxies.get(proxy);

    if (!data) return;

    if (data.mock) {
      return data.mock.deref();
    }

    return;
  }
}
