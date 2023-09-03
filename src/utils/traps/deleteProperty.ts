import Exotic from "../../types/Exotic.js";
import map from "../map.js";
import findProxy from "../findProxy.js";

const deleteProperty = (mock: Exotic.Mock, key: Exotic.key): boolean => {
  const proxy = findProxy(mock);
  const { target, sandbox } = map.proxies.get(proxy);

  // try to delete the value from the original target as well
  // also catch because the target may be untraceable
  try {
    delete target[key];
  } catch (error) {
    /* empty */
  }

  return Reflect.deleteProperty(sandbox, key);
};

export default deleteProperty;
