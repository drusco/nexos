import type nx from "../types/Nexo.js";
import getTarget from "../utils/getTarget.js";
import getProxy from "../utils/getProxy.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import update from "./update.js";

const construct = (fn: nx.voidFunction, args: nx.arrayLike = []): object => {
  const proxy = map.tracables.get(fn);
  const { target, nexo } = map.proxies.get(proxy);
  const resultProxy = getProxy(nexo);

  const event = new ProxyEvent("construct", {
    target: proxy,
    data: { arguments: args, result: resultProxy },
    cancelable: true,
  });

  if (event.defaultPrevented) {
    // return the value from the prevented event
    return update(resultProxy, event.returnValue) as object;
  }

  if (typeof target === "function") {
    // get the value from the original target instance

    const result = Reflect.construct(
      target,
      args.map((arg) => getTarget(arg)),
    );

    // update the proxy
    return update(resultProxy, result);
  }

  return resultProxy;
};

export default construct;
