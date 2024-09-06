import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const has = (target: nx.traceable, property: nx.objectKey): boolean => {
  const proxy = map.tracables.get(target);
  const { sandbox } = map.proxies.get(proxy);
  const targetHasProperty = Reflect.has(target, property);
  const sandboxHasProperty = sandbox ? Reflect.has(sandbox, property) : false;
  const result = sandbox ? sandboxHasProperty : targetHasProperty;

  new ProxyEvent("has", {
    target: proxy,
    data: { target, property, result },
  });

  if (sandbox) {
    return sandboxHasProperty;
  }

  return targetHasProperty;
};

export default has;
