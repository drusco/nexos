import type nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import ProxyError from "../errors/ProxyError.js";

const apply = (
  target: nx.traceable,
  thisArg: unknown = undefined,
  args: nx.arrayLike = [],
): unknown => {
  const proxy = map.tracables.get(target);
  const { traceable } = map.proxies.get(proxy);

  const event = new ProxyEvent("apply", {
    target: proxy,
    cancelable: true,
    data: {
      target,
      thisArg,
      args,
    },
  });

  if (event.defaultPrevented) {
    // return the value from the prevented event
    return event.returnValue;
  }

  if (traceable && typeof target === "function") {
    // return the result of the traceable function target
    try {
      return Reflect.apply(target, thisArg, args);
    } catch (error) {
      throw new ProxyError(error.message, proxy);
    }
  }
};

export default apply;
