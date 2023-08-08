import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import findProxy from "../findProxy";
import map from "../map";

const construct = (mock: Exotic.Mock, args: any[]): object => {
  const proxy = findProxy(mock);
  const { scope, target } = map.proxies.get(proxy);

  scope.dispatchEvent(new Event("construct"));

  const origin: Exotic.proxy.origin = {
    action: "construct",
    proxy,
    args,
  };

  let value: any;

  if (typeof target === "function") {
    value = Reflect.construct(target, args);
  }

  const argList = args.map((arg) => createProxy(scope, arg, origin));
  origin.args = argList;

  return createProxy(scope, value, origin);
};

export default construct;
