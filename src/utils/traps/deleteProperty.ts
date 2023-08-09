import Exotic from "../../types/Exotic";
import map from "../map";
import findProxy from "../findProxy";

const deleteProperty = (mock: Exotic.Mock, key: Exotic.key): boolean => {
  const proxy = findProxy(mock);
  const { target, sandbox } = map.proxies.get(proxy);

  try {
    // delete from original target too
    delete target[key];
  } catch (error) {
    /* empty */
  }

  return Reflect.deleteProperty(sandbox, key);
};

export default deleteProperty;
