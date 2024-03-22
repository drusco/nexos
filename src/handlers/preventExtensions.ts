import Nexo from "../types/Nexo.js";
import { map } from "../utils/index.js";
import ProxyEvent from "../events/ProxyEvent.js";

const preventExtensions = (mock: Nexo.Mock): boolean => {
  const proxy = map.tracables.get(mock);
  const data = map.proxies.get(proxy);
  const scope = data.scope.deref();

  const event = new ProxyEvent("preventExtensions", proxy);

  scope.emit(event.name, event);
  mock.emit(event.name, event);

  if (event.defaultPrevented) {
    data.isExtensible = event.returnValue === false;

    return !data.isExtensible;
  }

  data.isExtensible = false;

  return !data.isExtensible;
};

export default preventExtensions;
