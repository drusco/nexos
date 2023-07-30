import Exotic from "../../types/Exotic";
import map from "../map";
import findProxy from "../findProxy";

const deleteProperty = (dummy: Exotic.FunctionLike, key: string): boolean => {
  const proxy = findProxy(dummy);
  const { target, sandbox, scope } = map.proxies.get(proxy);

  // delete from original target too
  if (map.targets.has(target)) delete target[key];

  scope.emit("action", {
    action: "delete",
    proxy,
    key,
  });

  // set value to undefined but keep key for [get] to use
  return Reflect.set(sandbox, key, undefined);
};

export default deleteProperty;
