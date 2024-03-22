import Nexo from "../types/Nexo.js";
import { map } from "../utils/index.js";
import ProxyEvent from "../events/ProxyEvent.js";

const deleteProperty = (mock: Nexo.Mock, key: Nexo.objectKey): boolean => {
  const proxy = map.tracables.get(mock);
  const data = map.proxies.get(proxy);
  const { sandbox } = data;
  const scope = data.scope.deref();

  const event = new ProxyEvent("deleteProperty", proxy, { key });

  scope.emit(event.name, event);
  mock.emit(event.name, event);

  if (event.defaultPrevented) {
    return false;
  }

  return sandbox.delete(key);
};

export default deleteProperty;
