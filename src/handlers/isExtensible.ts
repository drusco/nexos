import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

const isExtensible = (fn: nx.functionLike): boolean => {
  const proxy = map.tracables.get(fn);
  const data = map.proxies.get(proxy);
  const { isExtensible } = data;
  const scope = data.nexo;
  const wrapper = new ProxyWrapper(proxy);

  const event = new ProxyEvent("isExtensible", { target: proxy });

  scope.events.emit(event.name, event);
  wrapper.events.emit(event.name, event);

  if (event.defaultPrevented) {
    return event.returnValue === true;
  }

  return isExtensible;
};

export default isExtensible;
