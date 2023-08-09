import lib from "./lib";
import Exotic from "./types/Exotic";

export default class Emulator extends EventTarget implements Exotic.Emulator {
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

  use(value?: any): Exotic.Proxy {
    return lib.methods.use(this, value);
  }

  useRef(key: Exotic.key, value?: any): Exotic.Proxy {
    return lib.methods.useRef(this, key, value);
  }

  getId(value: Exotic.traceable): number {
    return lib.methods.getId(this, value);
  }

  target(value?: any): any {
    return lib.methods.target(this, value);
  }

  parent(value?: Exotic.traceable): undefined | Exotic.Proxy {
    return lib.methods.parent(this, value);
  }

  values(value?: Exotic.traceable): Exotic.Proxy[] {
    return lib.methods.values(this, value);
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

  entries(): IterableIterator<Exotic.Proxy> {
    return lib.methods.entries(this);
  }

  entriesBefore(value: Exotic.traceable): IterableIterator<Exotic.Proxy> {
    return lib.methods.entriesBefore(this, value);
  }

  entriesAfter(value: Exotic.traceable): IterableIterator<Exotic.Proxy> {
    return lib.methods.entriesAfter(this, value);
  }

  encode(value: any): Exotic.payload {
    return lib.methods.encode(this, value);
  }

  get(value?: any): Promise<any> {
    return lib.methods.get(this, value);
  }
}
