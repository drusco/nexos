import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import map from "../map";

const apply = (
  dummy: Exotic.FunctionLike,
  that?: object,
  args?: unknown[],
): unknown => {
  const proxy = map.dummies.get(dummy);
  const { scope, namespace, target } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "apply",
    proxy,
    that,
    args,
  };

  if (typeof target === "function") {
    return target.apply(that, args);
  }
  return createProxy(scope, undefined, namespace, origin);
};

export default apply;
