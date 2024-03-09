import Nexo from "../../types/Nexo.js";
import getProxy from "../getProxy.js";
import getTarget from "../getTarget.js";
import map from "../map.js";

const construct = (mock: Nexo.Mock, args: unknown[]): Nexo.Proxy => {
  const proxy = map.tracables.get(mock);
  const data = map.proxies.get(proxy);
  const { scope } = data;

  const origin: Nexo.proxy.origin.construct = {
    name: "construct",
    proxy,
    args,
  };

  let value: unknown;
  const target = getTarget(data.target);

  if (typeof target === "function") {
    value = Reflect.construct(
      target,
      origin.args.map((arg) => getTarget(arg)),
    );
  }

  return getProxy(scope.deref(), value);
};

export default construct;
