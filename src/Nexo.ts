import NexoTS from "./types/Nexo.js";
import EventEmitter from "node:events";
import { getProxy, isTraceable, map, encode } from "./utils/index.js";

export default class Nexo extends EventEmitter {
  protected options: NexoTS.options = {};
  readonly proxies: NexoTS.proxy.map = new Map();
  readonly links: NexoTS.proxy.map = new Map();

  private _release: boolean = false;
  private _releaseCallback = (
    wref: NexoTS.proxy.ref,
    id: string,
    map: NexoTS.proxy.map,
  ) => {
    if (wref.deref() === undefined) {
      map.delete(id);
      this.emit("nx.delete", id);
    }
  };

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

  clear(): void {
    this.proxies.clear();
    this.links.clear();
    this.emit("nx.clear");
  }

  release(): void {
    if (this._release) return;

    this._release = true;

    const current = this.proxies.size;

    this.proxies.forEach(this._releaseCallback);
    this.links.forEach(this._releaseCallback);

    const deleted = current - this.proxies.size;

    if (deleted > 0) {
      this.emit("nx.release", { active: this.proxies.size, deleted });
    }

    this._release = false;
  }

  static encode(value: unknown, callback?: (value: unknown) => unknown) {
    return encode(value, callback);
  }
}
