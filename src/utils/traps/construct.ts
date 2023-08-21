import Exotic from "../../types/Exotic.js";
import createProxy from "../createProxy.js";
import findProxy from "../findProxy.js";
import map from "../map.js";

const construct = (mock: Exotic.Mock, args: any[]): object => {
  const proxy = findProxy(mock);
  const { scope, target } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "construct",
    proxy,
    args: args.map((arg) => createProxy(scope, undefined, arg)),
  };

  let value: any;

  if (typeof target === "function") {
    value = Reflect.construct(
      scope.target(target),
      args.map((arg) => scope.target(arg)),
    );
  }

  return createProxy(scope, origin, value);
};

export default construct;
