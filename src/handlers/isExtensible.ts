import Nexo from "../types/Nexo.js";
import { map } from "../utils/index.js";
import ProxyHandlerEvent from "../events/ProxyHandlerEvent.js";

const isExtensible = (mock: Nexo.Mock): boolean => {
  const proxy = map.tracables.get(mock);
  const data = map.proxies.get(proxy);
  const { isExtensible } = data;
  const scope = data.scope.deref();

  const event = new ProxyHandlerEvent("isExtensible", proxy);

  scope.emit(event.name, event);

  if (event.defaultPrevented) {
    return event.returnValue === true;
  }

  return isExtensible;
};

export default isExtensible;
