import NexoTS from "./types/Nexo.js";
import EventEmitter from "node:events";
import { getProxy, isTraceable } from "./utils/index.js";

export default class Nexo extends EventEmitter {
  protected options: NexoTS.options = {};
  readonly map: Map<string, WeakRef<NexoTS.Proxy>> = new Map();
  readonly links: Map<string, WeakRef<NexoTS.Proxy>> = new Map();

  constructor(options?: NexoTS.options) {
    super();

    if (options) {
      this.options = { ...this.options, ...options };
    }
  }

  new(target?: NexoTS.traceable): NexoTS.Proxy {
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

    this.emit("link", name, proxy);

    return proxy;
  }

  unlink(name: string): boolean {
    this.emit("unlink", name);

    return this.links.delete(name);
  }

  // target(value?: any): any {}

  // revoke(value: Nexo.traceable): boolean {}
  // encode(value: any): any {}
  // decode(value: any): any {}
  // exec(
  //   method: Nexo.functionLike,
  //   dependencies?: Record<string, Nexo.Proxy>,
  // ): Nexo.Proxy {}

  get totalProxies(): number {
    return this.map.size;
  }
}
