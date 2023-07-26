import Exotic from "../../types/Emulator.js";
import map from "../map.js";

const deleteProperty = (dummy: Exotic.FunctionLike, key: string): boolean => {
  const item = map.dummies.get(dummy);
  const { target, sandbox, scope } = map.proxies.get(item);

  // delete from original target too
  if (map.targets.has(target)) delete target[key];

  scope.emit("action", {
    action: "delete",
    item,
    key,
  });

  // set value to undefined but keep key for [get] to use
  return Reflect.set(sandbox, key, undefined);
};

export default deleteProperty;
