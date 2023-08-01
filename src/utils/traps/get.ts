import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import findProxy from "../findProxy";
import map from "../map";

const get = (dummy: Exotic.FunctionLike, key: string): unknown => {
  const proxy = findProxy(dummy);
  const { scope, namespace, target, sandbox } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "get",
    key,
    proxy,
  };

  let value: any = sandbox[key];

  // get new target from sandbox
  if (value === undefined) {
    try {
      // target may be untraceable
      value = target[key];
    } catch (error) {
      /* empty */
    }
  }

  sandbox[key] = createProxy(scope, value, namespace, origin);

  return Reflect.get(sandbox, key);
};

export default get;
