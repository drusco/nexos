import Nexo from "../../lib/types/Nexo.js";
import { getTarget } from "../index.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";
import map from "../../lib/maps.js";

const getOwnPropertyDescriptor = (
  wrapper: Nexo.Wrapper,
  key: Nexo.objectKey,
): PropertyDescriptor => {
  const proxy = map.tracables.get(wrapper);
  const data = map.proxies.get(proxy);

  const { sandbox } = data;
  const scope = data.scope.deref();
  const value = getTarget(sandbox.get(key), true);

  const event = new ProxyEvent("getOwnPropertyDescriptor", proxy, {
    key,
  });

  scope.emit(event.name, event);
  wrapper.emit(event.name, event);

  return {
    configurable: true,
    enumerable: true,
    writable: true,
    value,
  };
};

export default getOwnPropertyDescriptor;
