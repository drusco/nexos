import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const isExtensible = (target: nx.traceable): boolean => {
  const proxy = map.tracables.get(target);

  const event = new ProxyEvent("isExtensible", { target: proxy });

  if (event.defaultPrevented) {
    return event.returnValue === true;
  }

  return Reflect.isExtensible(target);
};

export default isExtensible;
