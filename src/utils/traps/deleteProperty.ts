import Exotic from "../../types/Exotic";
import map from "../map";
import findProxy from "../findProxy";

const deleteProperty = (dummy: Exotic.FunctionLike, key: string): boolean => {
  const proxy = findProxy(dummy);
  const { target, sandbox, scope } = map.proxies.get(proxy);

  try {
    // delete from original target too
    delete target[key];
    scope.emit("action", {
      action: "delete",
      proxy,
      key,
    });
  } catch (error) {
    /* empty */
  }

  return Reflect.deleteProperty(sandbox, key);
};

export default deleteProperty;
