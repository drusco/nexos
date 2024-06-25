import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

const preventExtensions = (fn: nx.functionLike): boolean => {
  const proxy = map.tracables.get(fn);
  const data = map.proxies.get(proxy);
  const scope = data.scope;
  const wrapper = new ProxyWrapper(proxy);

  const event = new ProxyEvent("preventExtensions", { target: proxy });

  scope.events.emit(event.name, event);
  wrapper.events.emit(event.name, event);

  if (event.defaultPrevented) {
    data.isExtensible = event.returnValue === false;

    return !data.isExtensible;
  }

  data.isExtensible = false;

  return !data.isExtensible;
};

export default preventExtensions;
