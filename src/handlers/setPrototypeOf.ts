import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const setPrototypeOf = (target: nx.traceable, prototype: object): boolean => {
  const proxy = map.tracables.get(target);

  const event = new ProxyEvent("setPrototypeOf", {
    target: proxy,
    data: { target, prototype },
  });

  if (event.defaultPrevented) {
    if (typeof event.returnValue === "object") {
      return true;
    }
    return false;
  }

  return true;
};

export default setPrototypeOf;
