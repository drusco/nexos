import Nexo from "../../lib/types/Nexo.js";
import map from "../../lib/maps.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";

const ownKeys = (wrapper: Nexo.Wrapper): Nexo.objectKey[] => {
  const proxy = map.tracables.get(wrapper);
  const data = map.proxies.get(proxy);
  const { sandbox } = data;
  const scope = data.scope.deref();
  const keys: Nexo.objectKey[] = [];

  const event = new ProxyEvent("ownKeys", { target: proxy });

  scope.emit(event.name, event);
  wrapper.emit(event.name, event);

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
