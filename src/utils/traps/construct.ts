import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import map from "../map";

const construct = (dummy: Exotic.FunctionLike, args: unknown[]): object => {
  const item = map.dummies.get(dummy);
  const { scope, group } = map.proxies.get(item);

  const origin: Exotic.proxy.origin = {
    action: "construct",
    item,
    args,
  };

  return createProxy(scope, undefined, group, origin);
};

export default construct;
