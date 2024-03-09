import Nexo from "../../types/Nexo.js";
import getProxy from "../getProxy.js";
import getTarget from "../getTarget.js";
import map from "../map.js";

const apply = (
  mock: Nexo.Mock,
  that?: unknown,
  args?: unknown[],
): Nexo.Proxy => {
  const proxy = map.tracables.get(mock);
  const { target, scope } = map.proxies.get(proxy);

  const origin: Nexo.proxy.origin.apply = {
    name: "apply",
    proxy,
    that,
    args,
  };

  let value: unknown;
  const proxyTarget = getTarget(target);

  if (typeof proxyTarget === "function") {
    value = Reflect.apply(
      proxyTarget,
      getTarget(that),
      origin.args.map((arg) => getTarget(arg)),
    );
  }

  return getProxy(scope.deref(), value);
};

export default apply;
