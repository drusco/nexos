import Nexo from "../../types/Nexo.js";
import getProxy from "../getProxy.js";
import getTarget from "../getTarget.js";
import map from "../map.js";

const construct = (mock: Nexo.Mock, args: unknown[]): Nexo.Proxy => {
  const proxy = map.tracables.get(mock);
  const data = map.proxies.get(proxy);

  // const origin: Nexo.proxy.origin.construct = {
  //   name: "construct",
  //   proxy,
  //   args,
  // };

  const target = getTarget(data.target);
  const scope = data.scope.deref();

  if (typeof target === "function") {
    // get the value from the original target

    const instance: object = Reflect.construct(
      target,
      args.map((arg) => getTarget(arg)),
    );

    return getProxy(scope, instance);
  }

  return getProxy(scope);
};

export default construct;
