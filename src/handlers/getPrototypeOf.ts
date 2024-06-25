import type nx from "../types/Nexo.js";
import getTarget from "../utils/getTarget.js";
import isTraceable from "../utils/isTraceable.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

const getPrototypeOf = (fn: nx.functionLike): object => {
  const proxy = map.tracables.get(fn);
  const data = map.proxies.get(proxy);
  const target = getTarget(data.target);
  const scope = data.scope;
  const wrapper = new ProxyWrapper(proxy);

  const event = new ProxyEvent("getPrototypeOf", { target: proxy });

  scope.events.emit(event.name, event);
  wrapper.events.emit(event.name, event);

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
