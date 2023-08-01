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
  const { scope, namespace, sandbox } = map.proxies.get(proxy);

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

  // set new value to sandbox only
  return Reflect.set(sandbox, key, newValue);
};

export default set;
