import lib from "./lib/index.js";
import Exotic from "./types/Exotic.js";
import EventEmitter from "events";

export default class Emulator extends EventEmitter implements Exotic.Emulator {
  constructor(options?: Exotic.emulator.options) {
    super();
    lib.constructor(this, options);
  }

  get refs(): Exotic.key[] {
    return lib.getters.refs(this);
  }

  get length(): number {
    return lib.getters.length(this);
  }

  use(value?: any): Exotic.Proxy {
    return lib.methods.use(this, value);
  }

  link(key: Exotic.key, value?: any): Exotic.Proxy {
    return lib.methods.link(this, key, value);
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

  get(...values: any[]): Promise<any[]> {
    return lib.methods.get(this, ...values);
  }

  revokeAll(): void {
    return lib.methods.revokeAll(this);
  }

  include(
    encodedProxy: string,
    origin: Exotic.proxy.origin,
    target?: any,
  ): any {
    return lib.methods.include(this, encodedProxy, origin, target);
  }

  exec(func: Exotic.FunctionLike, map: Record<string, Exotic.Proxy>): any {
    return lib.methods.exec(this, func, map);
  }
}
