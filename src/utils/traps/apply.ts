import Exotic from "../../types/Exotic.js";
import createProxy from "../createProxy.js";
import findProxy from "../findProxy.js";
import map from "../map.js";

const apply = (mock: Exotic.Mock, that?: any, args?: any[]): Exotic.Proxy => {
  const proxy = findProxy(mock);
  const { scope, target } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "apply",
    proxy,
    that,
    args: args.map((arg) => createProxy(scope, undefined, arg)),
  };

  let value: any;

  if (typeof target === "function") {
    value = Reflect.apply(
      scope.target(target),
      scope.target(that),
      origin.args.map((arg) => scope.target(arg)),
    );
  }

  return createProxy(scope, origin, value);
};

export default apply;
