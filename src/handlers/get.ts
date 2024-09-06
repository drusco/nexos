import type nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";

const get = (target: nx.traceable, property: nx.objectKey): unknown => {
  const proxy = map.tracables.get(target);
  const { sandbox, nexo } = map.proxies.get(proxy);

  new ProxyEvent("get", {
    target: proxy,
    data: { target, property },
  });

  if (sandbox) {
    return Reflect.has(sandbox, property)
      ? Reflect.get(sandbox, property)
      : nexo.create();
  }

  return Reflect.get(target, property);
};

export default get;
