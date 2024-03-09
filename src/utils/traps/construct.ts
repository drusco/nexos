import Nexo from "../../types/Nexo.js";
import getProxy from "../getProxy.js";
import getTarget from "../getTarget.js";
import map from "../map.js";

const construct = (mock: Nexo.Mock, args: unknown[]): Nexo.Proxy => {
  const proxy = map.tracables.get(mock);
  const { scope, target } = map.proxies.get(proxy);

  const origin: Nexo.proxy.origin.construct = {
    name: "construct",
    proxy,
    args,
  };

  let value: unknown;
  const proxyTarget = getTarget(target);

  if (typeof proxyTarget === "function") {
    value = Reflect.construct(
      proxyTarget,
      origin.args.map((arg) => getTarget(arg)),
    );
  }

  return getProxy(scope.deref(), value);
};

export default construct;
