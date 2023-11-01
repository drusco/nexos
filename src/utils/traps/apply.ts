import Exotic from "../../types/Exotic.js";
import tryProxy from "../tryProxy.js";
import findProxy from "../findProxy.js";
import map from "../map.js";

const apply = (mock: Exotic.Mock, that?: any, args?: any[]): Exotic.Proxy => {
  const proxy = findProxy(mock) as Exotic.Proxy;
  const { scope, target } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "apply",
    proxy,
    that,
    args: args.map((arg) => tryProxy(scope, arg)),
  };

  let value: any;

  if (typeof target === "function") {
    value = Reflect.apply(
      target,
      scope.target(that),
      origin.args.map((arg) => scope.target(arg)),
    );
  }

  return tryProxy(scope, value);
};

export default apply;
