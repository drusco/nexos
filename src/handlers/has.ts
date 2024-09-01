import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const has = (target: nx.traceable, key: nx.objectKey): boolean => {
  const proxy = map.tracables.get(target);
  const data = map.proxies.get(proxy);

  const { sandbox } = data;

  const event = new ProxyEvent("has", { target: proxy, data: { target, key } });

  if (event.defaultPrevented) {
    return event.returnValue === true;
  }

  return sandbox.has(key);
};

export default has;
