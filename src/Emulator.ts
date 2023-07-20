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

  use(
    value?: object | EmulatorNS.functionLike | undefined | string,
  ): EmulatorNS.functionLike;
  use(value?: unknown): unknown {
    const isString = typeof value === "string";
    const isObject = typeof value === "object";
    const isFunction = typeof value === "function";
    const isUndefined = typeof value === "undefined";

    if (isString && value.length) {
      return bindString(this, value);
    }

    if (isObject) {
      if (value === this) return this; // prevent using instance as target
      if (value === null) return null;
    }

    if (isFunction) {
      if (proxies.has(value as EmulatorNS.functionLike)) return value; // value is already a proxy
    }

    if (isObject || isFunction) {
      if (targets.has(value)) return targets.get(value); // return proxy linked to value
    }

    if (isUndefined || isObject || isFunction) {
      return bindTraceable(this, value);
    }

    return value; // return original value
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

  used(value: any): boolean {
    const { bindings }: EmulatorNS.private = secret.get(this);
    const isGroup = typeof value === "string" && !!bindings[value];

    let isItem: boolean = false;
    let isLinkedToItem: boolean = false;

    if (typeof value === "object") {
      isLinkedToItem = targets.has(value);
    }

    if (typeof value === "function") {
      isItem = proxies.has(value);
    }

    return isGroup || isItem || isLinkedToItem;
  }

  contains(a: EmulatorNS.traceable, b: EmulatorNS.traceable): boolean {
    if (!this.exists(a) || !this.exists(b)) return false;

    let origin: EmulatorNS.origin;

    if (typeof b === "function") {
      const item = proxies.get(b as EmulatorNS.functionLike);
      origin = item.origin;
    }

    while (origin) {
      const { item } = origin;
      if (item === a) return true;
      origin = null;
      if (typeof item === "function" && this.exists(item)) {
        origin = proxies.get(item as EmulatorNS.functionLike).origin;
      }
    }

    return false;
  }

  encode(
    value: EmulatorNS.traceable,
    callback?: EmulatorNS.functionLike,
  ): object {
    if (
      typeof value === "function" &&
      proxies.has(value as EmulatorNS.functionLike)
    ) {
      const { id } = proxies.get(value as EmulatorNS.functionLike);

      if (typeof callback == "function") {
        callback(value);
      }

      return { id, encoded: true };
    }

    if (typeof value == "object") {
      const copy = Array.isArray(value) ? [] : {};

      for (const key in value) {
        if (!value[key]) continue;
        copy[key] = this.encode(value[key], callback);
      }

      value = copy;
    }

    return value;
  }

  exists(item: EmulatorNS.traceable): boolean {
    if (typeof item !== "function") return false;
    return proxies.has(item as EmulatorNS.functionLike);
  }

  getId(item: EmulatorNS.traceable): number {
    // Access the internal id of a proxy
    if (typeof item !== "function") return;
    if (!this.exists(item)) return;
    return proxies.get(item as EmulatorNS.functionLike).id;
  }

  revoke(...args: EmulatorNS.functionLike[]): void {
    for (const traceable of args) {
      revokeProxy(traceable);
    }
  }

  destroy(): void {
    this.removeAllListeners();
    secret.delete(this);
  }

  async resolve(item: EmulatorNS.traceable): Promise<void> {
    // Access the real value of a proxy

    if (!this.exists(item) && typeof item != "object") return;

    return new Promise((resolve): void => {
      // 'resolve' event listener must exists
      // resolve function expects to be called
      this.emit("resolve", item, resolve);
    });
  }

  async resolveId(item: EmulatorNS.traceable): Promise<void> {
    // Access the external id of a proxy

    if (!this.exists(item) && typeof item != "object") return;

    return new Promise((resolve): void => {
      // 'resolveId' event listener must exists
      // resolve function expects to be called
      this.emit("resolveId", item, resolve);
    });
  }

  static equal(a: EmulatorNS.traceable, b: EmulatorNS.traceable): boolean {
    /* fix wrong result when comparing target === item[target] */

    if (a === b) return true; // same allocation
    if (targets.has(a)) return targets.get(a) === b; // a has item, compare its item to b
    if (targets.has(b)) return targets.get(b) === a; // b has item, compare its item to a

    return false;
  }

  static getEventNames(): string[] {
    return [...events];
  }
}

const secret = new WeakMap<EmulatorNS.EmulatorClass, EmulatorNS.private>();
const dummies = new WeakMap<EmulatorNS.functionLike, EmulatorNS.functionLike>();
const targets = new WeakMap<EmulatorNS.traceable, EmulatorNS.functionLike>();
const proxies = new WeakMap<EmulatorNS.functionLike, EmulatorNS.item>();

const events = [
  "proxy",
  "action",
  "revoke",
  "bindString",
  "deleteGroup",
  "resolve",
  "resolveId",
];

// Item traps

const traps = {
  get(dummy: EmulatorNS.functionLike, key: string): unknown {
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
          sandbox[key] = bindTraceable(scope, target[key], origin, group);
        } else {
          sandbox[key] = target[key];
        }
      } else {
        sandbox[key] = bindTraceable(scope, undefined, origin, group);
      }
    }

    return Reflect.get(sandbox, key);
  },

  set(dummy: EmulatorNS.functionLike, key: string, value: unknown): boolean {
    const item = dummies.get(dummy);
    const { scope, group, sandbox } = proxies.get(item);
    const traceable = isTraceable(value);

    const origin: EmulatorNS.origin = {
      action: "set",
      item,
      key,
      value,
    };

    const final = traceable
      ? bindTraceable(scope, value as EmulatorNS.traceable, origin, group)
      : value;

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
  },

  deleteProperty(dummy: EmulatorNS.functionLike, key: string): boolean {
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
  },

  construct(dummy: EmulatorNS.functionLike, args: unknown[]): object {
    const item = dummies.get(dummy);
    const { scope, group } = proxies.get(item);

    const origin: EmulatorNS.origin = {
      action: "construct",
      item,
      args,
    };

    return bindTraceable(scope, undefined, origin, group);
  },

  apply(
    dummy: EmulatorNS.functionLike,
    that?: object,
    args?: unknown[],
  ): unknown {
    const item = dummies.get(dummy);
    const { scope, group, target } = proxies.get(item);

    const origin: EmulatorNS.origin = {
      action: "apply",
      item,
      that,
      args,
    };

    if (typeof target === "function") {
      target.apply(that, args);
    }
    return bindTraceable(scope, undefined, origin, group);
  },
};

const isTraceable = ((value: unknown): boolean => {
  const isObject = typeof value === "object";
  const isFunction = typeof value === "function";
  if (!(isObject || isFunction)) return false;
  if (value === null) return false;
  if (targets.has(value)) return false; // has item linked to it
  if (isFunction && proxies.has(value as EmulatorNS.functionLike)) return false; // is item
  return true;
}) satisfies EmulatorNS.isTraceable;

const revokeProxy = ((proxy: EmulatorNS.functionLike): void => {
  // @params
  // item [item] an active item

  if (!proxies.has(proxy)) return;

  const { id, scope, group, dummy, revoke, target } = proxies.get(proxy);
  const _private = secret.get(scope);
  const _group = _private.bindings[group];

  if (_group) {
    _group.length--;

    if (_group.length === 0) {
      // delete the group when it is empty
      delete _private.bindings[group];
      scope.emit("deleteGroup", group);
      _private.groupCount--;
    }
  }

  // remove item references

  dummies.delete(dummy);
  targets.delete(target);
  proxies.delete(proxy);

  revoke();

  _private.activeItems--;

  scope.emit("revoke", id);
}) satisfies EmulatorNS.revokeProxy;

const bindTraceable = ((
  scope: EmulatorNS.EmulatorClass,
  target: EmulatorNS.traceable, // original target used for proxy
  origin?: EmulatorNS.origin, // the action used to create the proxy
  groupId?: string,
): EmulatorNS.functionLike => {
  if (targets.has(target)) return targets.get(target); // return proxy linked to target
  if (
    typeof target === "function" &&
    proxies.has(target as EmulatorNS.functionLike)
  ) {
    return target as EmulatorNS.functionLike; // target is already proxy
  }

  const data: EmulatorNS.private = secret.get(scope);
  const { bindings } = data;

  const itemId = ++data.itemCount;
  const dummy = function () {};
  const traceable = isTraceable(target);
  const { proxy, revoke } = Proxy.revocable(dummy, traps);
  const group = bindings[groupId];

  // set information about the item

  const item: EmulatorNS.item = {
    id: itemId,
    dummy,
    origin,
    target,
    revoke,
    scope,
    sandbox: Object.create(null),
    group: group && groupId,
  };

  scope.emit("proxy", {
    id: itemId,
    item: proxy,
    origin,
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
}) satisfies EmulatorNS.bindTraceable;

const bindString = ((
  scope: EmulatorNS.EmulatorClass,
  id: string,
  target?: EmulatorNS.traceable,
): EmulatorNS.functionLike => {
  const data: EmulatorNS.private = secret.get(scope);
  const { bindings } = data;

  // return existing root item
  if (bindings[id]) {
    return bindings[id].rootItem;
  }

  const rootItem: EmulatorNS.functionLike = bindTraceable(
    scope,
    target,
    undefined,
    id,
  );

  const group: EmulatorNS.group = {
    length: 0,
    rootItem,
  };

  data.groupCount += 1;
  bindings[id] = group;

  scope.emit("bindString", id);

  return rootItem;
}) satisfies EmulatorNS.bindString;
