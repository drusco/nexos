import type Nexo from "../../lib/types/Nexo.js";
import map from "../../lib/maps.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";

const isExtensible = (wrapper: Nexo.Wrapper): boolean => {
  const proxy = map.tracables.get(wrapper);
  const data = map.proxies.get(proxy);
  const { isExtensible } = data;
  const scope = data.scope;

  const event = new ProxyEvent("isExtensible", { target: proxy });

  scope.emit(event.name, event);
  wrapper.emit(event.name, event);

  if (event.defaultPrevented) {
    return event.returnValue === true;
  }

  return isExtensible;
};

export default isExtensible;
