import Exotic from "../../types/Exotic.js";
import createProxy from "../createProxy.js";
import findProxy from "../findProxy.js";
import map from "../map.js";

const set = (mock: Exotic.Mock, key: Exotic.key, value: any): boolean => {
  const proxy = findProxy(mock);
  const { scope, sandbox, target } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "set",
    proxy,
    key,
    value,
  };

  const newValue = createProxy(scope, origin, value);

  try {
    target[key] = scope.target(value);
  } catch (error) {
    /* empty */
  }

  return Reflect.set(sandbox, key, newValue);
};

export default set;
