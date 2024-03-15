import Nexo from "../types/Nexo.js";
import { getTarget, isTraceable, map } from "../utils/index.js";
import ProxyHandlerEvent from "../events/ProxyHandlerEvent.js";

const getPrototypeOf = (mock: Nexo.Mock): object => {
  const proxy = map.tracables.get(mock);
  const data = map.proxies.get(proxy);
  const target = getTarget(data.target);
  const scope = data.scope.deref();

  const event = new ProxyHandlerEvent("getPrototypeOf", proxy);

  scope.emit(event.name, event);
  mock.emit(event.name, event);

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
