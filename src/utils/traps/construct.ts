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
    args,
  };

  let value: any;

  if (typeof target === "function") {
    value = Reflect.construct(target, args);
  }

  const argList = args.map((arg) => createProxy(scope, undefined, arg));
  origin.args = argList;

  return createProxy(scope, origin, value);
};

export default construct;
