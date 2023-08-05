import Exotic from "./types/Exotic";
import { findProxy, map, createProxy } from "./utils";
import { symbols } from "./utils/constants";
import { EventEmitter } from "events";

export default class Emulator extends EventEmitter implements Exotic.Emulator {
  public static symbols = symbols;

  constructor(options: Exotic.emulator.options = {}) {
    super();

    const data: Exotic.emulator.data = {
      options,
      refs: Object.create(null),
      totalProxies: 0, // total item count including revoked items, it only increases
      activeProxies: 0, // items that are not revoked
    };

    map.emulators.set(this, data);
  }

  get refs(): Exotic.key[] {
    const { refs }: Exotic.emulator.data = map.emulators.get(this);
    return Reflect.ownKeys(refs);
  }

  get active(): number {
    const { activeProxies }: Exotic.emulator.data = map.emulators.get(this);
    return activeProxies;
  }

  get void(): number {
    const { activeProxies, totalProxies }: Exotic.emulator.data =
      map.emulators.get(this);
    return totalProxies - activeProxies;
  }

  get length(): number {
    const { totalProxies }: Exotic.emulator.data = map.emulators.get(this);
    return totalProxies;
  }

  useRef(key: Exotic.key): Exotic.Proxy {
    const { refs }: Exotic.emulator.data = map.emulators.get(this);
    const group = refs[key];

    // return the first proxy in the existing group
    if (group) return group.root;

    // create the first proxy for a new group
    return createProxy(this, undefined, key);
  }

  use(value?: any): Exotic.Proxy {
    return createProxy(this, value);
  }

  target(value?: any): any {
    const proxy = findProxy(value);
    if (!proxy) return value;
    const { target } = map.proxies.get(proxy);
    return target;
  }

  parent(value?: Exotic.traceable): undefined | Exotic.Proxy {
    const proxy = findProxy(value);
    if (!proxy) return;
    const { origin } = map.proxies.get(proxy);
    return origin && origin.proxy;
  }

  children(value?: Exotic.traceable): Exotic.Proxy[] {
    const results = [];
    const proxy = findProxy(value);
    if (!proxy) return results;
    const { sandbox } = map.proxies.get(proxy);
    return Reflect.ownKeys(sandbox).map((key) => sandbox[key]);
  }

  ownKeys(value?: Exotic.traceable): Exotic.key[] {
    const proxy = findProxy(value);
    if (!proxy) return [];
    const { sandbox } = map.proxies.get(proxy);
    return Reflect.ownKeys(sandbox);
  }

  revoke(value: Exotic.traceable): void {
    const proxy = findProxy(value);
    if (!proxy) return;

    const proxyData = map.proxies.get(proxy);
    const data = map.emulators.get(this);

    const { id, refKey, mock, revoke, target, origin } = proxyData;
    const { refs } = data;
    const group = refs[refKey];

    if (group.root === proxy) {
      // delete group
      delete refs[refKey];
      this.emit("unbind", refKey);
    }

    // remove item references

    if (origin) {
      const { action, key, proxy: parentProxy } = origin;
      if (action === "get" || action === "set") {
        // delete from parent proxy and target
        if (parentProxy) delete parentProxy[key];
      }
    }

    map.mocks.delete(mock);
    map.targets.delete(target);

    // keep proxy in map
    // to prevent proxy out of revoked proxy (throws error)
    //map.proxies.delete(proxy);

    revoke();

    proxyData.revoked = true;
    data.activeProxies -= 1;

    this.emit("revoke", id);
  }

  revoked(value: Exotic.traceable): boolean {
    const proxy = findProxy(value);
    if (!proxy) return false;
    const { revoked } = map.proxies.get(proxy);
    return revoked;
  }

  //revokeAll(value?: Exotic.traceable): void {
  // const proxy = findProxy(value);
  // if (!proxy) {
  //   this.keys.forEach(key => this.revoke())
  //   return;
  // }
  //}

  *entries(value?: Exotic.traceable): Iterable<Exotic.Proxy> {
    if (value === undefined) {
      for (const ref of this.refs) {
        for (const proxy of this.entries(this.useRef(ref))) {
          if (!this.revoked(proxy)) {
            yield proxy;
          }
        }
      }
      return;
    }

    const proxy = findProxy(value);
    if (!proxy) return;

    if (!this.revoked(proxy)) {
      yield proxy;
    }

    const { next } = map.proxies.get(proxy);

    if (next) {
      for (const proxy of this.entries(next)) {
        if (!this.revoked(proxy)) {
          yield proxy;
        }
      }
    }
  }

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
    return { id, target, [symbols.PROXY]: true };
  }
}
