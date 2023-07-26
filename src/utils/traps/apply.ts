import Exotic from "../../types/Emulator";
import createProxy from "../createProxy";
import map from "../map";

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
