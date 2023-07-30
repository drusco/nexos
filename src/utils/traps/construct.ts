import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import findProxy from "../findProxy";
import isTraceable from "../isTraceable";
import map from "../map";

const construct = (dummy: Exotic.FunctionLike, args: unknown[]): object => {
  const proxy = findProxy(dummy);
  const { scope, namespace, target } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "construct",
    proxy,
    args,
  };

  let newTarget: any;

  if (typeof target === "function") {
    const value = Reflect.construct(dummy, args, target);

    if (isTraceable(value))
      newTarget = createProxy(scope, value, namespace, origin);
    else newTarget = value;
  }

  return createProxy(scope, newTarget, namespace, origin);
};

export default construct;
