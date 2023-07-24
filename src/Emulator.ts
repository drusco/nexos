import EmulatorNS from "./types/Emulator";
import { EventEmitter } from "events";

export default class Emulator
  extends EventEmitter
  implements EmulatorNS.EmulatorClass
{
  constructor(options: EmulatorNS.options = {}) {
    super();

    const data: EmulatorNS.private = {
      options,
      bindings: Object.create(null),
      itemCount: 0, // total item count including revoked items, it only increases
      activeItems: 0, // items that are not revoked
      groupCount: 0,
    };

    secret.set(this, data);
  }

  namespace(namespace: string): EmulatorNS.proxy {
    if (!namespace.length) {
      throw Error("namespace cannot be an empty string");
    }

    const data: EmulatorNS.private = secret.get(this);
    const { bindings } = data;

    // return existing root proxy
    if (bindings[namespace]) {
      return bindings[namespace].rootProxy;
    }

    // create new root proxy
    const proxy: EmulatorNS.proxy = createProxy(this, namespace, namespace);

    const group: EmulatorNS.group = {
      length: 0,
      rootProxy: proxy,
    };

    data.groupCount += 1;
    bindings[namespace] = group;

    this.emit("namespace", namespace);

    return proxy;
  }

  use(value?: any): EmulatorNS.proxy {
    //if (value === this) return null;
    if (proxies.has(value)) return value; // value is already a proxy
    if (targets.has(value)) return targets.get(value); // return proxy linked to value

    return createProxy(this, value);
  }

  groups(): number {
    const { groupCount }: EmulatorNS.private = secret.get(this);
    return groupCount;
  }

  count(): number {
    const { activeItems }: EmulatorNS.private = secret.get(this);
    return activeItems;
  }

  total(): number {
    const { itemCount }: EmulatorNS.private = secret.get(this);
    return itemCount;
  }

  // no estoy seguro si tiene algun uso
  // voy a comentar para aprovechar la logica de busqueda por origen

  // contains(a: EmulatorNS.traceable, b: EmulatorNS.traceable): boolean {
  //   if (!exists(a)) return false;
  //   if (!exists(b)) return false;

  //   let origin: EmulatorNS.origin;

  //   const item = exists(b) ? this.use(b) : null;
  //   origin = item?.origin;

  //   while (origin) {
  //     const { item } = origin;
  //     if (item === a) return true;
  //     origin = null;
  //     if (exists(item)) {
  //       origin = proxies.get(item as EmulatorNS.proxy).origin;
  //     }
  //   }

  //   return false;
  // }

  encode(value: unknown): unknown {
    if (exists(value)) {
      const { id } = proxies.get(this.use(value));
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

  revoke(proxy: EmulatorNS.proxy): void {
    if (!proxies.has(proxy)) return;

    const { id, group: namespace, dummy, revoke, target } = proxies.get(proxy);
    const data = secret.get(this);
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

    dummies.delete(dummy);
    targets.delete(target);
    proxies.delete(proxy);

    revoke();

    data.activeItems--;

    this.emit("revoke", id);
  }

  destroy(): void {
    this.removeAllListeners();
    secret.delete(this);
  }

  resolve(value: any): EmulatorNS.itemPublicData {
    if (!exists(value)) return value;
    const proxy = this.use(value);
    const { id, target } = proxies.get(proxy);
    return { id, target };
  }
}

const secret = new WeakMap<EmulatorNS.EmulatorClass, EmulatorNS.private>();
const dummies = new WeakMap<EmulatorNS.proxy, EmulatorNS.proxy>();
const targets = new WeakMap<EmulatorNS.traceable, EmulatorNS.proxy>();
const proxies = new WeakMap<EmulatorNS.proxy, EmulatorNS.item>();

const getTrap = (dummy: EmulatorNS.proxy, key: string): unknown => {
  const item = dummies.get(dummy);
  const { scope, group, target, sandbox } = proxies.get(item);

  const origin: EmulatorNS.origin = {
    action: "get",
    key,
    item,
  };

  // treat everything as a proxy

  const sandboxKeys = Object.keys(sandbox);

  if (!sandboxKeys.includes(key)) {
    if (targets.has(target) && target[key] !== undefined) {
      if (isTraceable(target[key])) {
        sandbox[key] = createProxy(scope, target[key], group, origin);
      } else {
        sandbox[key] = target[key];
      }
    } else {
      sandbox[key] = createProxy(scope, undefined, group, origin);
    }
  }

  return Reflect.get(sandbox, key);
};

const setTrap = (
  dummy: EmulatorNS.proxy,
  key: string,
  value: unknown,
): boolean => {
  const item = dummies.get(dummy);
  const { scope, group, sandbox } = proxies.get(item);
  const traceable = isTraceable(value);

  const origin: EmulatorNS.origin = {
    action: "set",
    item,
    key,
    value,
  };

  const final = traceable ? createProxy(scope, value, group, origin) : value;

  if (final === value) {
    // final value is not traceable
    scope.emit("action", {
      action: "set",
      item,
      key,
      value: final,
    });
  }

  // set final value to sandbox only
  return Reflect.set(sandbox, key, final);
};

const deletePropertyTrap = (dummy: EmulatorNS.proxy, key: string): boolean => {
  const item = dummies.get(dummy);
  const { target, sandbox, scope } = proxies.get(item);

  // delete from original target too
  if (targets.has(target)) delete target[key];

  scope.emit("action", {
    action: "delete",
    item,
    key,
  });

  // set value to undefined but keep key for [get] to use
  return Reflect.set(sandbox, key, undefined);
};

const constructTrap = (dummy: EmulatorNS.proxy, args: unknown[]): object => {
  const item = dummies.get(dummy);
  const { scope, group } = proxies.get(item);

  const origin: EmulatorNS.origin = {
    action: "construct",
    item,
    args,
  };

  return createProxy(scope, undefined, group, origin);
};

const applyTrap = (
  dummy: EmulatorNS.proxy,
  that?: object,
  args?: unknown[],
): unknown => {
  const item = dummies.get(dummy);
  const { scope, group, target } = proxies.get(item);

  const origin: EmulatorNS.origin = {
    action: "apply",
    item,
    that,
    args,
  };

  if (typeof target === "function") {
    return target.apply(that, args);
  }
  return createProxy(scope, undefined, group, origin);
};

const traps = {
  get: getTrap,
  set: setTrap,
  deleteProperty: deletePropertyTrap,
  construct: constructTrap,
  apply: applyTrap,
};

const createProxy = (
  scope: EmulatorNS.EmulatorClass,
  target: EmulatorNS.traceable,
  namespace?: string,
  trap?: EmulatorNS.origin, // the action used to create the proxy
): EmulatorNS.proxy => {
  if (targets.has(target)) return targets.get(target); // return proxy linked to target
  if (typeof target === "function" && proxies.has(target as EmulatorNS.proxy)) {
    return target as EmulatorNS.proxy; // target is already proxy
  }

  const data: EmulatorNS.private = secret.get(scope);
  const { bindings } = data;

  const itemId = ++data.itemCount;
  const dummy = function () {};
  const traceable = isTraceable(target);
  const { proxy, revoke } = Proxy.revocable(dummy, traps);
  const group = bindings[namespace];

  // set information about the item

  const item: EmulatorNS.item = {
    id: itemId,
    dummy,
    origin: trap,
    target,
    revoke,
    scope,
    sandbox: Object.create(null),
    group: group && namespace,
  };

  scope.emit("proxy", {
    id: itemId,
    item: proxy,
    origin: trap,
    group: item.group,
  });

  if (group) {
    group.length += 1;
  }

  data.activeItems += 1;

  dummies.set(dummy, proxy);
  proxies.set(proxy, item);

  if (traceable) {
    targets.set(target, proxy);
  }

  return proxy;
};

const exists = (value: any): boolean => {
  if (proxies.has(value)) return true;
  if (targets.has(value)) return true;
  return false;
};

const isTraceable = (value: any): boolean => {
  const isObject = typeof value === "object";
  const isFunction = typeof value === "function";

  if (!isObject && !isFunction) return false;
  if (value === null) return false;
  if (exists(value)) return false;

  return true;
};
