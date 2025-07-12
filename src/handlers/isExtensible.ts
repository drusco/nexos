import type * as nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const isExtensible = (target: nx.Traceable): boolean => {
  const proxy = map.tracables.get(target);
  const extensible = Reflect.isExtensible(target);

  new ProxyEvent("isExtensible", {
    target: proxy,
    cancelable: false,
    data: { target, result: extensible },
  });

  return extensible;
};

export default isExtensible;
