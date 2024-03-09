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
  const data = map.proxies.get(proxy);
  const { scope } = data;

  // const origin: Nexo.proxy.origin.apply = {
  //   name: "apply",
  //   proxy,
  //   that,
  //   args,
  // };

  let value: unknown;
  const target = getTarget(data.target);

  if (typeof target === "function") {
    value = Reflect.apply(
      target,
      getTarget(that),
      args.map((arg) => getTarget(arg)),
    );
  }

  return getProxy(scope.deref(), value);
};

export default apply;
