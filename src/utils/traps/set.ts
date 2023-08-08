import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import findProxy from "../findProxy";
import map from "../map";

const set = (mock: Exotic.Mock, key: Exotic.key, value: any): boolean => {
  const proxy = findProxy(mock);
  const { scope, sandbox, target } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "set",
    proxy,
    key,
    value,
  };

  const newValue = createProxy(scope, value, origin);
  origin.value = newValue;

  scope.dispatchEvent(new Event("set"));

  try {
    target[key] = scope.target(value);
  } catch (error) {
    /* empty */
  }

  return Reflect.set(sandbox, key, newValue);
};

export default set;
