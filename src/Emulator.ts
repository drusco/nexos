import Exotic from "./types/Emulator";
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

  namespace(namespace: string): Exotic.Proxy {
    if (!namespace.length) {
      throw Error("namespace cannot be an empty string");
    }

    const data: Exotic.emulator.private = map.emulators.get(this);
    const { bindings } = data;

    // return existing root proxy
    if (bindings[namespace]) {
      return bindings[namespace].root;
    }

    // create new root proxy
    const proxy: Exotic.Proxy = createProxy(this, namespace, namespace);

    const group: Exotic.proxy.group = {
      length: 0,
      root: proxy,
    };

    data.groupCount += 1;
    bindings[namespace] = group;

    this.emit("namespace", namespace);

    return proxy;
  }

  use(value?: any): Exotic.Proxy {
    //if (value === this) return null;
    if (map.proxies.has(value)) return value; // value is already a proxy
    if (map.targets.has(value)) return map.targets.get(value); // return proxy linked to value

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

  // no estoy seguro si tiene algun uso
  // voy a comentar para aprovechar la logica de busqueda por origen
  contains(a: Exotic.Traceable, b: Exotic.Traceable): boolean {
    console.log(a, b);
    return true;
    // if (!findProxy(a)) return false;
    // if (!findProxy(b)) return false;
    // let origin: Exotic.proxy.origin;
    // const item = findProxy(b) ? this.use(b) : null;
    // origin = item?.origin;
    // while (origin) {
    //   const { item } = origin;
    //   if (item === a) return true;
    //   origin = null;
    //   if (findProxy(item)) {
    //     origin = map.proxies.get(item as Exotic.Proxy).origin;
    //   }
    // }
    // return false;
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

  revoke(proxy: Exotic.Proxy): void {
    if (!map.proxies.has(proxy)) return;

    const {
      id,
      group: namespace,
      dummy,
      revoke,
      target,
    } = map.proxies.get(proxy);
    const data = map.emulators.get(this);
    const ns = data.bindings[namespace];

    if (ns) {
      ns.length--;

      if (ns.length === 0) {
        // delete the group when it is empty
        delete data.bindings[namespace];
        this.emit("deleteGroup", namespace);
        data.groupCount--;
      }
    }

    // remove item references

    map.dummies.delete(dummy);
    map.targets.delete(target);
    map.proxies.delete(proxy);

    revoke();

    data.activeItems--;

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
