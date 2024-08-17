import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const setPrototypeOf = (fn: nx.voidFunction, prototype: object): boolean => {
  const proxy = map.tracables.get(fn);

  const event = new ProxyEvent("setPrototypeOf", { target: proxy });

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
