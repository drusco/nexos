import Nexo from "../../types/Nexo.js";
import getProxy from "../getProxy.js";
import getTarget from "../getTarget.js";
import map from "../map.js";

const apply = (mock: Nexo.Mock, that?: unknown, args?: unknown[]): unknown => {
  const proxy = map.tracables.get(mock);
  const data = map.proxies.get(proxy);

  // const origin: Nexo.proxy.origin.apply = {
  //   name: "apply",
  //   proxy,
  //   that,
  //   args,
  // };

  const target = getTarget(data.target);
  const scope = data.scope.deref();

  if (typeof target === "function") {
    // get the value from the original target

    const value: unknown = Reflect.apply(
      target,
      getTarget(that),
      args.map((arg) => getTarget(arg)),
    );

    return value;
  }

  return getProxy(scope);
};

export default apply;
