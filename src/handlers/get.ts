import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";

const get = (target: nx.Traceable, property: nx.ObjectKey): unknown => {
  const proxy = map.tracables.get(target);
  const { sandbox, nexo } = map.proxies.get(proxy);

  const result = sandbox
    ? Reflect.has(sandbox, property)
      ? Reflect.get(sandbox, property)
      : nexo.create()
    : Reflect.get(target, property);

  new ProxyEvent("get", {
    target: proxy,
    cancelable: false,
    data: { target, property, result },
  });

  return result;
};

export default get;
