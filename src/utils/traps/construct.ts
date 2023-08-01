import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import findProxy from "../findProxy";
import map from "../map";

const construct = (dummy: Exotic.FunctionLike, args: unknown[]): object => {
  const proxy = findProxy(dummy);
  const { scope, namespace, target } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "construct",
    proxy,
    args,
  };

  let value: any;

  if (typeof target === "function") {
    value = Reflect.construct(target, args);
  }

  const argList = args.map((arg) => createProxy(scope, arg, namespace, origin));
  origin.args = argList;

  return createProxy(scope, value, namespace, origin);
};

export default construct;
