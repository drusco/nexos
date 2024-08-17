import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const isExtensible = (fn: nx.functionLike): boolean => {
  const proxy = map.tracables.get(fn);

  const event = new ProxyEvent("isExtensible", { target: proxy });

  if (event.defaultPrevented) {
    return event.returnValue === true;
  }

  return Reflect.isExtensible(fn);
};

export default isExtensible;
