import Nexo from "../../lib/types/Nexo.js";
import map from "../../lib/maps.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";

const setPrototypeOf = (mock: Nexo.Mock, prototype: object): boolean => {
  const proxy = map.tracables.get(mock);
  const data = map.proxies.get(proxy);
  const scope = data.scope.deref();

  const event = new ProxyEvent("setPrototypeOf", proxy);

  scope.emit(event.name, event);
  mock.emit(event.name, event);

  if (event.defaultPrevented) {
    if (typeof event.returnValue === "object") {
      return true;
    }
    return false;
  }

  console.log(prototype);

  return true;
};

export default setPrototypeOf;
