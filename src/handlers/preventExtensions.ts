import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const preventExtensions = (fn: nx.functionLike): boolean => {
  const proxy = map.tracables.get(fn);

  new ProxyEvent("preventExtensions", { target: proxy });

  return Reflect.preventExtensions(fn);
};

export default preventExtensions;
