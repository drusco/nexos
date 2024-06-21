import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const setPrototypeOf = (wrapper: nx.Wrapper, prototype: object): boolean => {
  const proxy = map.tracables.get(wrapper);
  const data = map.proxies.get(proxy);
  const scope = data.scope;

  const event = new ProxyEvent("setPrototypeOf", { target: proxy });

  scope.emit(event.name, event);
  wrapper.emit(event.name, event);

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
