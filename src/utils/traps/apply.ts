import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import findProxy from "../findProxy";
import isTraceable from "../isTraceable";
import map from "../map";

const apply = (
  dummy: Exotic.FunctionLike,
  that?: object,
  args?: unknown[],
): unknown => {
  const proxy = findProxy(dummy);
  const { scope, namespace, target } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "apply",
    proxy,
    that,
    args,
  };

  let newTarget: any;

  if (typeof target === "function") {
    const value = Reflect.apply(target, that, args);

    if (isTraceable(value))
      newTarget = createProxy(scope, value, namespace, origin);
    else newTarget = value;
  }

  return createProxy(scope, newTarget, namespace, origin);
};

export default apply;
