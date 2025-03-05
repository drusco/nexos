import type * as nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const preventExtensions = (target: nx.Traceable): boolean => {
  const proxy = map.tracables.get(target);
  const result = Reflect.preventExtensions(target);

  new ProxyEvent("preventExtensions", {
    target: proxy,
    data: { target, result },
  });

  return result;
};

export default preventExtensions;
