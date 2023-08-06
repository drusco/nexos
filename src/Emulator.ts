import lib from "./lib";
import Exotic from "./types/Exotic";
import { findProxy, map } from "./utils";
import { EventEmitter } from "events";

export default class Emulator extends EventEmitter implements Exotic.Emulator {
  constructor(options: Exotic.emulator.options = {}) {
    super();
    lib.constructor(this, options);
  }

  get refs(): Exotic.key[] {
    return lib.getters.refs(this);
  }

  get active(): number {
    return lib.getters.active(this);
  }

  get revoked(): number {
    return lib.getters.revoked(this);
  }

  get length(): number {
    return lib.getters.length(this);
  }

  useRef(key: Exotic.key): Exotic.Proxy {
    return lib.methods.useRef(this, key);
  }

  use(value?: any): Exotic.Proxy {
    return lib.methods.use(this, value);
  }

  target(value?: any): any {
    return lib.methods.target(this, value);
  }

  parent(value?: Exotic.traceable): undefined | Exotic.Proxy {
    return lib.methods.parent(this, value);
  }

  children(value?: Exotic.traceable): Exotic.Proxy[] {
    return lib.methods.children(this, value);
  }

  ownKeys(value?: Exotic.traceable): Exotic.key[] {
    return lib.methods.ownKeys(this, value);
  }

  revoke(value: Exotic.traceable): boolean {
    return lib.methods.revoke(this, value);
  }

  isRevoked(value: Exotic.traceable): boolean {
    return lib.methods.isRevoked(this, value);
  }

  entries(): Iterable<Exotic.Proxy> {
    return lib.methods.entries(this);
  }

  entriesBefore(value: Exotic.traceable): Iterable<Exotic.Proxy> {
    return lib.methods.entriesBefore(this, value);
  }

  entriesAfter(value: Exotic.traceable): Iterable<Exotic.Proxy> {
    return lib.methods.entriesAfter(this, value);
  }

  // faltando

  useId() {}

  encode(value: unknown): unknown {
    if (findProxy(value)) {
      const { id } = map.proxies.get(this.use(value));
      return { id, encoded: true }; // TODO: usar Symbol para saber si es encoded o no
    }

    if (typeof value === "object" && value) {
      const copy = Array.isArray(value) ? [] : {};

      for (const key in value) {
        copy[key] = this.encode(value[key]);
      }

      value = copy;
    }

    return value;
  }

  resolve(value: any): Exotic.proxy.public {
    const proxy = findProxy(value);
    if (!proxy) return value;
    const { id, target } = map.proxies.get(proxy);
    return { id, target };
  }
}
