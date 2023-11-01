import Exotic from "../../types/Exotic.js";
import tryProxy from "../tryProxy.js";
import findProxy from "../findProxy.js";
import map from "../map.js";

const set = (mock: Exotic.Mock, key: Exotic.key, value: any): boolean => {
  const proxy = findProxy(mock) as Exotic.Proxy;
  const { scope, sandbox, target } = map.proxies.get(proxy);

  // const origin: Exotic.proxy.origin = {
  //   action: "set",
  //   proxy,
  //   key,
  //   value,
  // };

  const newValue = tryProxy(scope, value);

  // try to set the value to the original target
  // also catch because the target may be untraceable
  try {
    target[key] = scope.target(value);
  } catch (error) {
    /* empty */
  }

  return Reflect.set(sandbox, key, newValue);
};

export default set;
