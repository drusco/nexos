import lib from "./lib/index.js";
import Exotic from "./types/Exotic.js";
import EventEmitter from "events";

export default class Emulator extends EventEmitter implements Exotic.Emulator {
  constructor(options?: Exotic.emulator.options) {
    super();
    lib.constructor(this, options);
  }

  get links(): Exotic.key[] {
    return lib.getters.links(this);
  }

  get length(): number {
    return lib.getters.length(this);
  }

  use(value?: any): Exotic.Proxy {
    return lib.methods.use(this, value);
  }

  link(link: Exotic.key, value?: any): Exotic.Proxy {
    return lib.methods.link(this, link, value);
  }

  target(value?: any): any {
    return lib.methods.target(value);
  }

  parent(value?: Exotic.traceable): undefined | Exotic.Proxy {
    return lib.methods.parent(value);
  }

  values(value?: Exotic.traceable): Exotic.Proxy[] {
    return lib.methods.values(value);
  }

  keys(value?: Exotic.traceable): Exotic.key[] {
    return lib.methods.keys(value);
  }

  revoke(value: Exotic.traceable): boolean {
    return lib.methods.revoke(value);
  }

  isRevoked(value: Exotic.traceable): boolean {
    return lib.methods.isRevoked(value);
  }

  entries(): IterableIterator<Exotic.Proxy> {
    return lib.methods.entries(this);
  }

  encode(value: any): any {
    return lib.methods.encode(value);
  }

  decode(value: any): any {
    return lib.methods.decode(this, value);
  }

  revokeAll(): void {
    return lib.methods.revokeAll(this);
  }

  include(id: string, origin: Exotic.proxy.origin, target?: any): Exotic.Proxy {
    return lib.methods.include(this, id, origin, target);
  }

  exec(
    method: Exotic.FunctionLike,
    dependencies?: Record<string, Exotic.Proxy>,
  ): Exotic.Proxy {
    return lib.methods.exec(this, method, dependencies);
  }
}
