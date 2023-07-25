import Exotic from "../../types/Emulator";
import createProxy from "../createProxy";
import isTraceable from "../isTraceable";
import map from "../map";

const set = (
  dummy: Exotic.FunctionLike,
  key: string,
  value: unknown,
): boolean => {
  const item = map.dummies.get(dummy);
  const { scope, group, sandbox } = map.proxies.get(item);
  const traceable = isTraceable(value);

  const origin: Exotic.proxy.origin = {
    action: "set",
    item,
    key,
    value,
  };

  const final = traceable ? createProxy(scope, value, group, origin) : value;

  if (final === value) {
    // final value is not traceable
    scope.emit("action", {
      action: "set",
      item,
      key,
      value: final,
    });
  }

  // set final value to sandbox only
  return Reflect.set(sandbox, key, final);
};

export default set;
