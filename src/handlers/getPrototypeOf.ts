import type nx from "../types/Nexo.js";
import isTraceable from "../utils/isTraceable.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";

const getPrototypeOf = (target: nx.traceable): object => {
  const proxy = map.tracables.get(target);

  new ProxyEvent("getPrototypeOf", { target: proxy });

  try {
    if (isTraceable(target)) {
      return Object.getPrototypeOf(target);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // empty
  }

  return null;
};

export default getPrototypeOf;
