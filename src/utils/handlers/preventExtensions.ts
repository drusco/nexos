import type nx from "../../lib/types/Nexo.js";
import map from "../../lib/maps.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";

const preventExtensions = (wrapper: nx.Wrapper): boolean => {
  const proxy = map.tracables.get(wrapper);
  const data = map.proxies.get(proxy);
  const scope = data.scope;

  const event = new ProxyEvent("preventExtensions", { target: proxy });

  scope.emit(event.name, event);
  wrapper.emit(event.name, event);

  if (event.defaultPrevented) {
    data.isExtensible = event.returnValue === false;

    return !data.isExtensible;
  }

  data.isExtensible = false;

  return !data.isExtensible;
};

export default preventExtensions;
