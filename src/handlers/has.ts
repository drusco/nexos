import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const has = (fn: nx.voidFunction, key: nx.objectKey): boolean => {
  const proxy = map.tracables.get(fn);
  const data = map.proxies.get(proxy);

  const { sandbox } = data;

  const event = new ProxyEvent("has", { target: proxy, data: { key } });

  if (event.defaultPrevented) {
    return event.returnValue === true;
  }

  return sandbox.has(key);
};

export default has;
