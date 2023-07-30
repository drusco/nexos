import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import isTraceable from "../isTraceable";
import findProxy from "../findProxy";
import map from "../map";

const get = (dummy: Exotic.FunctionLike, key: string): unknown => {
  const proxy = findProxy(dummy);
  const { scope, namespace, target, sandbox } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "get",
    key,
    proxy,
  };

  const sandboxKeys = Reflect.ownKeys(sandbox);
  const newSandboxKey = !sandboxKeys.includes(key);

  if (newSandboxKey) {
    let newTarget: any;
    const valueExists = map.targets.has(target) && target[key] !== undefined;
    const traceable = !(valueExists && !isTraceable(target[key]));

    if (valueExists) newTarget = target[key];

    const value = traceable
      ? createProxy(scope, newTarget, namespace, origin)
      : newTarget;

    sandbox[key] = value;
  }

  return Reflect.get(sandbox, key);
};

export default get;
