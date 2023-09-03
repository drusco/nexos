import Exotic from "../../types/Exotic.js";
import createProxy from "../createProxy.js";
import findProxy from "../findProxy.js";
import map from "../map.js";

const get = (mock: Exotic.Mock, key: any): Exotic.Proxy => {
  if (key === Symbol.iterator) {
    return mock[key];
  }

  const proxy = findProxy(mock);
  const { scope, target, sandbox } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "get",
    key,
    proxy,
  };

  let value: any;

  // try to get the value from the original target first
  // because the value may have changed
  // also catch because the target may be untraceable
  try {
    value = target[key];
  } catch (error) {
    /* empty */
  }

  if (value === undefined) {
    value = sandbox[key];
  }

  sandbox[key] = createProxy(scope, origin, value);

  return Reflect.get(sandbox, key);
};

export default get;
