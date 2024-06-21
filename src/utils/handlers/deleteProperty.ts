import type nx from "../../lib/types/Nexo.js";
import map from "../../lib/maps.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";

const deleteProperty = (wrapper: nx.Wrapper, key: nx.objectKey): boolean => {
  const proxy = map.tracables.get(wrapper);
  const data = map.proxies.get(proxy);
  const { sandbox } = data;
  const scope = data.scope;

  const event = new ProxyEvent("deleteProperty", {
    target: proxy,
    data: { key },
  });

  scope.emit(event.name, event);
  wrapper.emit(event.name, event);

  if (event.defaultPrevented) {
    return false;
  }

  return sandbox.delete(key);
};

export default deleteProperty;
