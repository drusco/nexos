import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import findProxy from "../findProxy";
import map from "../map";

const apply = (mock: Exotic.Mock, that?: any, args?: any[]): any => {
  const proxy = findProxy(mock);
  const { scope, target } = map.proxies.get(proxy);

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

  const argList = args.map((arg) => createProxy(scope, undefined, arg));
  origin.args = argList;

  return createProxy(scope, origin, value);
};

export default apply;
