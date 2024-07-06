import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

const setPrototypeOf = (fn: nx.voidFunction, prototype: object): boolean => {
  const proxy = map.tracables.get(fn);
  const data = map.proxies.get(proxy);
  const scope = data.nexo;
  const wrapper = new ProxyWrapper(proxy);

  const event = new ProxyEvent("setPrototypeOf", { target: proxy });

  scope.events.emit(event.name, event);
  wrapper.events.emit(event.name, event);

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
