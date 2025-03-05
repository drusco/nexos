import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import ProxyError from "../errors/ProxyError.js";

const set = (
  target: nx.Traceable,
  property: nx.ObjectKey,
  value: unknown,
): boolean => {
  const proxy = map.tracables.get(target);
  const { sandbox } = map.proxies.get(proxy);

  const event = new ProxyEvent("set", {
    target: proxy,
    cancelable: true,
    data: { target, property, value },
  });

  if (event.defaultPrevented) {
    if (!Reflect.set(sandbox || target, property, event.returnValue)) {
      throw new ProxyError(
        `Cannot set property '${String(property)}' on the ${sandbox ? "sandbox" : "target"}`,
        proxy,
      );
    }
    return true;
  }

  if (!Reflect.set(sandbox || target, property, value)) {
    throw new ProxyError(
      `Cannot set property '${String(property)}' on the ${sandbox ? "sandbox" : "target"}`,
      proxy,
    );
  }

  return true;
};

export default set;
