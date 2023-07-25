import Exotic from "../types/Emulator";
import createProxy from "./createProxy";
import isTraceable from "./isTraceable";
import map from "./map";

const get = (dummy: Exotic.FunctionLike, key: string): unknown => {
  const item = map.dummies.get(dummy);
  const { scope, group, target, sandbox } = map.proxies.get(item);

  const origin: Exotic.proxy.origin = {
    action: "get",
    key,
    item,
  };

  // treat everything as a proxy

  const sandboxKeys = Object.keys(sandbox);

  if (!sandboxKeys.includes(key)) {
    if (map.targets.has(target) && target[key] !== undefined) {
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

const set = (
  dummy: Exotic.FunctionLike,
  key: string,
  value: unknown,
): boolean => {
  const item = map.dummies.get(dummy);
  const { scope, group, sandbox } = map.proxies.get(item);
  const traceable = isTraceable(value);

  const origin: Exotic.proxy.origin = {
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

const deleteProperty = (dummy: Exotic.FunctionLike, key: string): boolean => {
  const item = map.dummies.get(dummy);
  const { target, sandbox, scope } = map.proxies.get(item);

  // delete from original target too
  if (map.targets.has(target)) delete target[key];

  scope.emit("action", {
    action: "delete",
    item,
    key,
  });

  // set value to undefined but keep key for [get] to use
  return Reflect.set(sandbox, key, undefined);
};

const construct = (dummy: Exotic.FunctionLike, args: unknown[]): object => {
  const item = map.dummies.get(dummy);
  const { scope, group } = map.proxies.get(item);

  const origin: Exotic.proxy.origin = {
    action: "construct",
    item,
    args,
  };

  return createProxy(scope, undefined, group, origin);
};

const apply = (
  dummy: Exotic.FunctionLike,
  that?: object,
  args?: unknown[],
): unknown => {
  const item = map.dummies.get(dummy);
  const { scope, group, target } = map.proxies.get(item);

  const origin: Exotic.proxy.origin = {
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

export default { get, set, deleteProperty, construct, apply };
