import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import isTraceable from "../isTraceable";
import findProxy from "../findProxy";
import map from "../map";

const set = (
  dummy: Exotic.FunctionLike,
  key: string,
  value: unknown,
): boolean => {
  const proxy = findProxy(dummy);
  const { scope, namespace, sandbox } = map.proxies.get(proxy);
  const traceable = isTraceable(value);

  const origin: Exotic.proxy.origin = {
    action: "set",
    proxy,
    key,
    value,
  };

  const newValue = traceable
    ? createProxy(scope, value, namespace, origin)
    : value;

  if (newValue === value) {
    // new value is not traceable
    scope.emit("action", {
      action: "set",
      proxy,
      key,
      value: newValue,
    });
  }

  // set new value to sandbox only
  return Reflect.set(sandbox, key, newValue);
};

export default set;
