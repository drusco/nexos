import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

const ownKeys = (fn: nx.functionLike): nx.objectKey[] => {
  const proxy = map.tracables.get(fn);
  const data = map.proxies.get(proxy);
  const { sandbox } = data;
  const scope = data.scope;
  const keys: nx.objectKey[] = [];
  const wrapper = new ProxyWrapper(proxy);

  const event = new ProxyEvent("ownKeys", { target: proxy });

  scope.emit(event.name, event);
  wrapper.events.emit(event.name, event);

  if (event.defaultPrevented) {
    if (!Array.isArray(event.returnValue)) {
      return keys;
    }
    return event.returnValue.filter(
      (key) => typeof key === "string" || typeof key === "symbol",
    );
  }

  for (const key of sandbox.keys()) {
    keys.push(key);
  }

  return keys;
};

export default ownKeys;
