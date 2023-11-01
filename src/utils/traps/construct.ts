import Exotic from "../../types/Exotic.js";
import tryProxy from "../tryProxy.js";
import findProxy from "../findProxy.js";
import map from "../map.js";

const construct = (mock: Exotic.Mock, args: any[]): Exotic.Proxy => {
  const proxy = findProxy(mock) as Exotic.Proxy;
  const { scope, target } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "build",
    proxy,
    args: args.map((arg) => tryProxy(scope, arg)),
  };

  let value: any;

  if (typeof target === "function") {
    value = Reflect.construct(
      scope.target(target),
      origin.args.map((arg) => scope.target(arg)),
    );
  }

  return tryProxy(scope, value);
};

export default construct;
