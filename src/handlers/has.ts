import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const has = (wrapper: nx.Wrapper, key: nx.objectKey): boolean => {
  const proxy = map.tracables.get(wrapper);
  const data = map.proxies.get(proxy);

  const { sandbox } = data;
  const scope = data.scope;

  const event = new ProxyEvent("has", { target: proxy, data: { key } });

  scope.emit(event.name, event);
  wrapper.emit(event.name, event);

  if (event.defaultPrevented) {
    return event.returnValue === true;
  }

  return sandbox.has(key);
};

export default has;
