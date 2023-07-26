import Exotic from "../../types/Emulator.js";
import createProxy from "../createProxy.js";
import map from "../map.js";

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

export default apply;
