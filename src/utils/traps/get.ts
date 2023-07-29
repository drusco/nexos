import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import isTraceable from "../isTraceable";
import map from "../map";

const get = (dummy: Exotic.FunctionLike, key: string): unknown => {
  const proxy = map.dummies.get(dummy);
  const { scope, namespace, target, sandbox } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "get",
    key,
    proxy,
  };

  // treat everything as a proxy

  const sandboxKeys = Object.keys(sandbox);

  if (!sandboxKeys.includes(key)) {
    if (map.targets.has(target) && target[key] !== undefined) {
      if (isTraceable(target[key])) {
        sandbox[key] = createProxy(scope, target[key], namespace, origin);
      } else {
        sandbox[key] = target[key];
      }
    } else {
      sandbox[key] = createProxy(scope, undefined, namespace, origin);
    }
  }

  return Reflect.get(sandbox, key);
};

export default get;
