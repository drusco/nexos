import type nx from "../types/Nexo.js";
import getTarget from "../utils/getTarget.js";
import isTraceable from "../utils/isTraceable.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";

const getPrototypeOf = (wrapper: nx.Wrapper): object => {
  const proxy = map.tracables.get(wrapper);
  const data = map.proxies.get(proxy);
  const target = getTarget(data.target);
  const scope = data.scope;

  const event = new ProxyEvent("getPrototypeOf", { target: proxy });

  scope.emit(event.name, event);
  wrapper.emit(event.name, event);

  try {
    if (isTraceable(target)) {
      return Object.getPrototypeOf(target);
    }
  } catch (error) {
    // empty
  }

  return null;
};

export default getPrototypeOf;
