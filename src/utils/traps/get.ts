import Exotic from "../../types/Exotic.js";
import createProxy from "../createProxy.js";
import isTraceable from "../isTraceable.js";
import map from "../map.js";

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

export default get;
