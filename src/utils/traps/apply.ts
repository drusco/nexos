import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import findProxy from "../findProxy";
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

  let value: any;

  if (typeof target === "function") {
    value = Reflect.apply(scope.target(target), scope.target(that), args);
  }

  const argList = args.map((arg) => createProxy(scope, arg, namespace, origin));
  origin.args = argList;

  return createProxy(scope, value, namespace, origin);
};

export default apply;
