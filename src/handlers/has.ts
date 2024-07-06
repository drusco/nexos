import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

const has = (fn: nx.voidFunction, key: nx.objectKey): boolean => {
  const proxy = map.tracables.get(fn);
  const data = map.proxies.get(proxy);
  const wrapper = new ProxyWrapper(proxy);

  const { sandbox } = data;
  const scope = data.nexo;

  const event = new ProxyEvent("has", { target: proxy, data: { key } });

  scope.events.emit(event.name, event);
  wrapper.events.emit(event.name, event);

  if (event.defaultPrevented) {
    return event.returnValue === true;
  }

  return sandbox.has(key);
};

export default has;
