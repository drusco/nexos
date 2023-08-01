import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import findProxy from "../findProxy";
import map from "../map";

const set = (
  dummy: Exotic.FunctionLike,
  key: string,
  value: unknown,
): boolean => {
  const proxy = findProxy(dummy);
  const { scope, namespace, sandbox, target } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "set",
    proxy,
    key,
    value,
  };

  const newValue = createProxy(scope, value, namespace, origin);
  origin.value = newValue;

  scope.emit("action", {
    action: "set",
    proxy,
    key,
    value: newValue,
  });

  try {
    target[key] = scope.target(value);
  } catch (error) {
    /* empty */
  }

  return Reflect.set(sandbox, key, newValue);
};

export default set;
