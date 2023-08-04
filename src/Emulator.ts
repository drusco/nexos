import Exotic from "./types/Exotic";
import { findProxy, map, createProxy } from "./utils";
import { EventEmitter } from "events";

export default class Emulator extends EventEmitter implements Exotic.Emulator {
  static iterator = Symbol(90);

  get refs(): Exotic.namespace[] {
    const { bindings }: Exotic.emulator.data = map.emulators.get(this);
    return Reflect.ownKeys(bindings);
  }

  constructor(options: Exotic.emulator.options = {}) {
    super();

    const data: Exotic.emulator.data = {
      options,
      bindings: Object.create(null),
      itemCount: 0, // total item count including revoked items, it only increases
      activeItems: 0, // items that are not revoked
    };

    map.emulators.set(this, data);
  }

  bind(namespace: Exotic.namespace): Exotic.Proxy {
    const { bindings }: Exotic.emulator.data = map.emulators.get(this);
    const group = bindings[namespace];

    // return the first proxy in the existing group
    if (group) return group.root;

    // create the first proxy for a new group
    return createProxy(this, undefined, namespace);
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

    const { id, namespace, dummy, revoke, target } = map.proxies.get(proxy);
    const data = map.emulators.get(this);
    const { bindings } = data;
    const group = bindings[namespace];

    if (group) {
      group.length -= 1;

      if (!group.length) {
        // delete empty group
        delete bindings[namespace];
        this.emit("unbind", namespace);
      }
    }

    // remove item references

    map.dummies.delete(dummy);
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
