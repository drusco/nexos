import EmulatorNS from "./Emulator.d";
import { EventEmitter } from "events";

export default class Emulator
  extends EventEmitter
  implements EmulatorNS.EmulatorClass
{
  constructor(options: EmulatorNS.options) {
    super();

    const data: EmulatorNS.private = {
      options,
      groups: Object.create(null),
      itemCount: 0, // total item count including revoked items, it only increases
      activeItems: 0, // items that are not revoked
      groupCount: 0,
    };

    secret.set(this, data);
  }

  use(value: any): any {
    if (typeof value === "string" && value.length) {
      return createGroup.call(this, value);
    }

    if (typeof value === "object") {
      if (value === this) return this; // prevent using instance as target
      if (value === null) return null;
      if (targets.has(value)) return targets.get(value); // return item linked to value
      if (items.has(value)) return value; // value is already item
    }

    if (typeof value === "object" || typeof value === "undefined") {
      return createItem.call(this, null, value); // new item will not belong to any group
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

  used(value: unknown): boolean {
    const { groups }: EmulatorNS.private = secret.get(this);
    const isGroup = typeof value === "string" && !!groups[value];

    let isItem: boolean = false;
    let isLinkedToItem: boolean = false;

    if (typeof value === "object" || typeof value === "function") {
      isItem = items.has(value);
      isLinkedToItem = targets.has(value);
    }

    return isGroup || isItem || isLinkedToItem;
  }

  contains(a: EmulatorNS.traceable, b: EmulatorNS.traceable): boolean {
    if (!this.exists(a) || !this.exists(b)) return false;

    let origin: EmulatorNS.origin;

    if (typeof b === "object") {
      const item = items.get(b);
      origin = item.origin;
    }

    while (origin) {
      const { item } = origin;
      if (item === a) return true;
      origin = null;
      if (typeof item === "object" && this.exists(item)) {
        origin = items.get(item).origin;
      }
    }

    return false;
  }

  encode(
    value: EmulatorNS.traceable,
    callback: EmulatorNS.functionLike
  ): object {
    if (items.has(value)) {
      const { id } = items.get(value);

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
    return items.has(item);
  }

  getId(item: EmulatorNS.traceable): number {
    // Access the internal id of a proxy
    if (!this.exists(item)) return;
    return items.get(item).id;
  }

  revoke(...args: EmulatorNS.traceable[]): void {
    for (const traceable of args) {
      revokeItem(traceable);
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
const dummies = new WeakMap<EmulatorNS.functionLike, object>();
const targets = new WeakMap<EmulatorNS.traceable, unknown>(); // [target] -> item
const items = new WeakMap<EmulatorNS.traceable, EmulatorNS.item>();

const events = [
  "proxy",
  "action",
  "revoke",
  "createGroup",
  "deleteGroup",
  "resolve",
  "resolveId",
];

// Item context

const context = {
  get(dummy: EmulatorNS.functionLike, key: string): unknown {
    const item = dummies.get(dummy);
    const { scope, group, target, sandbox } = items.get(item);

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
          sandbox[key] = createItem.call(scope, group, target[key], origin);
        } else {
          sandbox[key] = target[key];
        }
      } else {
        sandbox[key] = createItem.call(scope, group, undefined, origin);
      }
    }

    return Reflect.get(sandbox, key);
  },

  set(dummy: EmulatorNS.functionLike, key: string, value: unknown): boolean {
    const item = dummies.get(dummy);
    const { scope, group, sandbox } = items.get(item);
    const traceable = isTraceable(value);

    const origin: EmulatorNS.origin = {
      action: "set",
      item,
      key,
      value,
    };

    const final = traceable
      ? createItem.call(scope, group, value, origin)
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
    const { target, sandbox, scope } = items.get(item);

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
    const { scope, group } = items.get(item);

    const origin = {
      action: "construct",
      item,
      args,
    };

    return createItem.call(scope, group, undefined, origin);
  },

  apply(
    dummy: EmulatorNS.functionLike,
    that: object,
    args: unknown[]
  ): unknown {
    const item = dummies.get(dummy);
    const { scope, group } = items.get(item);

    const origin = {
      action: "apply",
      item,
      that,
      args,
    };

    return createItem.call(scope, group, undefined, origin);
  },
};

// Helpers

function isTraceable(value: unknown): boolean {
  if (typeof value !== "object") return false;
  if (value === null) return false;
  if (targets.has(value)) return false; // has item linked to it
  if (items.has(value)) return false; // is item
  return true;
}

// Item methods

function revokeItem(item: EmulatorNS.traceable): void {
  // @params
  // item [item] an active item

  if (!items.has(item)) return;

  const { id, scope, group, dummy, revoke, target } = items.get(item);
  const _private = secret.get(scope);
  const _group = _private.groups[group];

  if (_group) {
    _group.length--;

    if (_group.length === 0) {
      // delete the group when it is empty
      delete _private.groups[group];
      scope.emit("deleteGroup", group);
      _private.groupCount--;
    }
  }

  // remove item references

  dummies.delete(dummy);
  targets.delete(target);
  items.delete(item);

  revoke();

  _private.activeItems--;

  scope.emit("revoke", id);
}

function createItem(
  groupId: string | undefined,
  target: EmulatorNS.traceable, // original target used for item
  origin: EmulatorNS.origin // the action used to create the item
): unknown {
  if (targets.has(target)) return targets.get(target); // return item linked to target
  if (items.has(target)) return target; // target is already item

  const data: EmulatorNS.private = secret.get(this);
  const { groups } = data;

  const id = ++data.itemCount;
  const dummy = function () {};
  const traceable = isTraceable(target);
  const { proxy, revoke } = Proxy.revocable(dummy, context);
  const group = groups[groupId];

  // set information about the item

  const item: EmulatorNS.item = {
    id,
    dummy,
    origin,
    target,
    revoke,
    scope: this,
    sandbox: Object.create(null),
    group: group && groupId,
  };

  this.emit("proxy", {
    id,
    item: proxy,
    origin,
    group: item.group,
  });

  if (group) {
    group.length += 1;
  }

  data.activeItems += 1;

  dummies.set(dummy, proxy);
  items.set(proxy, item);

  if (traceable) {
    targets.set(target, proxy);
  }

  return proxy;
}

// Group methods

function createGroup(id: string, target: object): unknown {
  const data: EmulatorNS.private = secret.get(this);
  const { groups } = data;

  // return existing root item
  if (groups[id]) {
    return groups[id].rootItem;
  }

  const rootItem: unknown = createItem.call(this, id, target);

  const group: EmulatorNS.group = {
    length: 0,
    rootItem,
  };

  data.groupCount += 1;
  groups[id] = group;

  this.emit("createGroup", id);

  return rootItem;
}
