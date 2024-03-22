import Nexo from "../types/Nexo.js";
import { getTarget, map } from "../utils/index.js";
import ProxyEvent from "../events/ProxyEvent.js";

const getOwnPropertyDescriptor = (
  mock: Nexo.Mock,
  key: Nexo.objectKey,
): PropertyDescriptor => {
  const proxy = map.tracables.get(mock);
  const data = map.proxies.get(proxy);

  const { sandbox } = data;
  const scope = data.scope.deref();
  const value = getTarget(sandbox.get(key), true);

  const event = new ProxyEvent("getOwnPropertyDescriptor", proxy, {
    key,
  });

  scope.emit(event.name, event);
  mock.emit(event.name, event);

  return {
    configurable: true,
    enumerable: true,
    writable: true,
    value,
  };
};

export default getOwnPropertyDescriptor;
