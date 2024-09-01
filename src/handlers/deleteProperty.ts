import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const deleteProperty = (target: nx.traceable, key: nx.objectKey): boolean => {
  const proxy = map.tracables.get(target);
  const data = map.proxies.get(proxy);
  const { sandbox } = data;

  const event = new ProxyEvent("deleteProperty", {
    target: proxy,
    data: { target, key },
  });

  if (event.defaultPrevented) {
    return false;
  }

  return sandbox.delete(key);
};

export default deleteProperty;
