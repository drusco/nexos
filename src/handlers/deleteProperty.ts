import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const deleteProperty = (fn: nx.voidFunction, key: nx.objectKey): boolean => {
  const proxy = map.tracables.get(fn);
  const data = map.proxies.get(proxy);
  const { sandbox } = data;

  const event = new ProxyEvent("deleteProperty", {
    target: proxy,
    data: { key },
  });

  if (event.defaultPrevented) {
    return false;
  }

  return sandbox.delete(key);
};

export default deleteProperty;
