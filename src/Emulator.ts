import Exotic from "./types/Exotic";
import { findProxy, map, createProxy } from "./utils";
import { EventEmitter } from "events";

export default class Emulator extends EventEmitter implements Exotic.Emulator {
  constructor(options: Exotic.emulator.options = {}) {
    super();

    const data: Exotic.emulator.private = {
      options,
      bindings: Object.create(null),
      itemCount: 0, // total item count including revoked items, it only increases
      activeItems: 0, // items that are not revoked
      groupCount: 0,
    };

    map.emulators.set(this, data);
  }

  namespace(namespace: Exotic.Namespace): Exotic.Proxy {
    const data: Exotic.emulator.private = map.emulators.get(this);
    const { bindings } = data;
    const proxyGroup = bindings[namespace];

    // return the first proxy in the existing group
    if (proxyGroup) return proxyGroup.first;

    // create the first proxy for a new group
    return createProxy(this, undefined, namespace);
  }

  use(value?: any): Exotic.Proxy {
    const proxy = findProxy(value);
    if (proxy) return proxy;
    return createProxy(this, value);
  }

  groups(): number {
    const { groupCount }: Exotic.emulator.private = map.emulators.get(this);
    return groupCount;
  }

  count(): number {
    const { activeItems }: Exotic.emulator.private = map.emulators.get(this);
    return activeItems;
  }

  total(): number {
    const { itemCount }: Exotic.emulator.private = map.emulators.get(this);
    return itemCount;
  }

  encode(value: unknown): unknown {
    if (findProxy(value)) {
      const { id } = map.proxies.get(this.use(value));
      return { id, encoded: true }; // TODO: usar Symbol para saber si es encoded o no
    }

    if (typeof value == "object" && value) {
      const copy = Array.isArray(value) ? [] : {};

      for (const key in value) {
        copy[key] = this.encode(value[key]);
      }

      value = copy;
    }

    return value;
  }

  revoke(value: Exotic.Traceable): void {
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
        data.groupCount -= 1;
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

  resolve(value: any): Exotic.emulator.itemPublicData {
    if (!findProxy(value)) return value;
    const proxy = this.use(value);
    const { id, target } = map.proxies.get(proxy);
    return { id, target };
  }
}
