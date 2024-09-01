import type nx from "../types/Nexo.js";
import getProxy from "../utils/getProxy.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import update from "./update.js";

const apply = (
  target: nx.traceable,
  that: unknown = undefined,
  args: nx.arrayLike = [],
): unknown => {
  const proxy = map.tracables.get(target);
  const { nexo, traceable } = map.proxies.get(proxy);
  const resultProxy = getProxy(nexo);

  const event = new ProxyEvent("apply", {
    target: proxy,
    data: {
      target,
      this: that,
      arguments: args,
      result: resultProxy,
    },
    cancelable: true,
  });

  if (event.defaultPrevented) {
    // return the value from the prevented event
    return update(resultProxy, event.returnValue);
  }

  if (traceable && typeof target === "function") {
    // return the value from the original target call

    const result = target.apply(that, args);

    // update the proxy
    return update(resultProxy, result);
  }

  return resultProxy;
};

export default apply;
