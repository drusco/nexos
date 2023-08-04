import Exotic from "./types/Exotic";
import { findProxy, map, createProxy } from "./utils";
import { EventEmitter } from "events";

export default class Emulator extends EventEmitter implements Exotic.Emulator {
  constructor(options: Exotic.emulator.options = {}) {
    super();

    const data: Exotic.emulator.data = {
      options,
      keys: Object.create(null),
      itemCount: 0, // total item count including revoked items, it only increases
      activeItems: 0, // items that are not revoked
    };

    map.emulators.set(this, data);
  }

  get keys(): Exotic.key[] {
    const { keys }: Exotic.emulator.data = map.emulators.get(this);
    return Reflect.ownKeys(keys);
  }

  bind(key: Exotic.key): Exotic.Proxy {
    const { keys }: Exotic.emulator.data = map.emulators.get(this);
    const group = keys[key];

    // return the first proxy in the existing group
    if (group) return group.root;

    // create the first proxy for a new group
    return createProxy(this, undefined, key);
  }

  proxy(value?: any): Exotic.Proxy {
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
    const results = [];
    const proxy = findProxy(value);
    if (!proxy) return results;
    const { sandbox } = map.proxies.get(proxy);
    return Reflect.ownKeys(sandbox);
  }

  count(): number {
    const { activeItems }: Exotic.emulator.data = map.emulators.get(this);
    return activeItems;
  }

  total(): number {
    const { itemCount }: Exotic.emulator.data = map.emulators.get(this);
    return itemCount;
  }

  encode(value: unknown): unknown {
    if (findProxy(value)) {
      const { id } = map.proxies.get(this.proxy(value));
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

  revoke(value: Exotic.traceable): void {
    const proxy = findProxy(value);
    if (!proxy) return;

    const { id, binding, mock, revoke, target } = map.proxies.get(proxy);
    const data = map.emulators.get(this);
    const { keys } = data;
    const group = keys[binding];

    if (group) {
      group.length -= 1;

      if (!group.length) {
        // delete empty group
        delete keys[binding];
        this.emit("unbind", binding);
      }
    }

    // remove item references

    map.mocks.delete(mock);
    map.targets.delete(target);
    map.proxies.delete(proxy);

    revoke();

    data.activeItems -= 1;

    this.emit("revoke", id);
  }

  destroy(): void {
    this.removeAllListeners();
    map.emulators.delete(this);
  }

  resolve(value: any): Exotic.proxy.public {
    if (!findProxy(value)) return value;
    const proxy = this.proxy(value);
    const { id, target } = map.proxies.get(proxy);
    return { id, target };
  }
}
