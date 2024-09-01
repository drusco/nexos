import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const preventExtensions = (target: nx.traceable): boolean => {
  const proxy = map.tracables.get(target);

  new ProxyEvent("preventExtensions", { target: proxy });

  return Reflect.preventExtensions(target);
};

export default preventExtensions;
