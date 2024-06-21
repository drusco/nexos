import type Nexo from "../../lib/types/Nexo.js";
import getTarget from "../getTarget.js";
import isTraceable from "../isTraceable.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";
import map from "../../lib/maps.js";

const getPrototypeOf = (wrapper: Nexo.Wrapper): object => {
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
