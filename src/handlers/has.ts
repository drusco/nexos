import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const has = (target: nx.traceable, property: nx.objectKey): boolean => {
  const proxy = map.tracables.get(target);
  const { sandbox } = map.proxies.get(proxy);

  new ProxyEvent("has", {
    target: proxy,
    data: { target, property },
  });

  if (sandbox) {
    return Reflect.has(sandbox, property);
  }

  return Reflect.has(target, property);
};

export default has;
