import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import isTraceable from "../isTraceable";
import map from "../map";

const set = (
  dummy: Exotic.FunctionLike,
  key: string,
  value: unknown,
): boolean => {
  const proxy = map.dummies.get(dummy);
  const { scope, namespace, sandbox } = map.proxies.get(proxy);
  const traceable = isTraceable(value);

  const origin: Exotic.proxy.origin = {
    action: "set",
    proxy,
    key,
    value,
  };

  const final = traceable
    ? createProxy(scope, value, namespace, origin)
    : value;

  if (final === value) {
    // final value is not traceable
    scope.emit("action", {
      action: "set",
      proxy,
      key,
      value: final,
    });
  }

  // set final value to sandbox only
  return Reflect.set(sandbox, key, final);
};

export default set;
