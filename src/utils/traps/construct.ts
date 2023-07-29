import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import map from "../map";

const construct = (dummy: Exotic.FunctionLike, args: unknown[]): object => {
  const proxy = map.dummies.get(dummy);
  const { scope, namespace } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "construct",
    proxy,
    args,
  };

  return createProxy(scope, undefined, namespace, origin);
};

export default construct;
