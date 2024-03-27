import Nexo from "../../lib/types/Nexo.js";
import map from "../../lib/maps.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";

const deleteProperty = (wrapper: Nexo.Wrapper, key: Nexo.objectKey): boolean => {
  const proxy = map.tracables.get(wrapper);
  const data = map.proxies.get(proxy);
  const { sandbox } = data;
  const scope = data.scope.deref();

  const event = new ProxyEvent("deleteProperty", proxy, { key });

  scope.emit(event.name, event);
  wrapper.emit(event.name, event);

  if (event.defaultPrevented) {
    return false;
  }

  return sandbox.delete(key);
};

export default deleteProperty;
