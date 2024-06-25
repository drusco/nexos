import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

const deleteProperty = (fn: nx.voidFunction, key: nx.objectKey): boolean => {
  const proxy = map.tracables.get(fn);
  const data = map.proxies.get(proxy);
  const { sandbox } = data;
  const scope = data.scope;
  const wrapper = new ProxyWrapper(proxy);

  const event = new ProxyEvent("deleteProperty", {
    target: proxy,
    data: { key },
  });

  scope.events.emit(event.name, event);
  wrapper.events.emit(event.name, event);

  if (event.defaultPrevented) {
    return false;
  }

  return sandbox.delete(key);
};

export default deleteProperty;
