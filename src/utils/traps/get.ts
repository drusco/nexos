import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import findProxy from "../findProxy";
import map from "../map";

const get = (mock: Exotic.Mock, key: Exotic.key): any => {
  const proxy = findProxy(mock);
  const { scope, refKey, target, sandbox } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "get",
    key,
    proxy,
  };

  if (key === Symbol.iterator) {
    return mock[key];
  }

  let value: any;

  // get value from original target
  // target may be untraceable
  try {
    value = target[key];
  } catch (error) {
    /* empty */
  }

  if (value === undefined) {
    value = sandbox[key];
  }

  sandbox[key] = createProxy(scope, value, refKey, origin);

  return Reflect.get(sandbox, key);
};

export default get;
