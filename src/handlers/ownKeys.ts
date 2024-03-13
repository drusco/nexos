import Nexo from "../types/Nexo.js";
import { map } from "../utils/index.js";
import ProxyHandlerEvent from "../events/ProxyHandlerEvent.js";

const ownKeys = (mock: Nexo.Mock): Nexo.objectKey[] => {
  const proxy = map.tracables.get(mock);
  const data = map.proxies.get(proxy);
  const { sandbox } = data;
  const scope = data.scope.deref();
  const keys: Nexo.objectKey[] = [];

  const event = new ProxyHandlerEvent("ownKeys", proxy);

  scope.emit(event.name, event);

  if (event.defaultPrevented) {
    if (!Array.isArray(event.returnValue)) {
      return keys;
    }
    return event.returnValue.filter(
      (key) => typeof key === "string" || typeof key === "symbol",
    );
  }

  for (const key of sandbox.keys()) {
    keys.push(key);
  }

  return keys;
};

export default ownKeys;
