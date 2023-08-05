import Exotic from "./types/Exotic";
import {
  findProxy,
  map,
  createProxy,
  proxyGenerator,
  revokeProxy,
} from "./utils";
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

  revoke(value: Exotic.traceable): boolean {
    return revokeProxy(this, value);
  }

  revoked(value: Exotic.traceable): boolean {
    const proxy = findProxy(value);
    if (!proxy) return false;
    const { revoked } = map.proxies.get(proxy);
    return revoked;
  }

  *entries(): Iterable<Exotic.Proxy> {
    for (const proxy of proxyGenerator(this)) {
      yield proxy;
    }
  }

  *entriesBefore(value: Exotic.traceable): Iterable<Exotic.Proxy> {
    for (const proxy of proxyGenerator(this, value, true)) {
      yield proxy;
    }
  }

  *entriesAfter(value: Exotic.traceable): Iterable<Exotic.Proxy> {
    for (const proxy of proxyGenerator(this, value, false)) {
      yield proxy;
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
