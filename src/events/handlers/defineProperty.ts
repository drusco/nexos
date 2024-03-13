import Nexo from "../../types/Nexo.js";
import { getTarget, isTraceable, map } from "../../utils/index.js";
import ProxyHandlerEvent from "../ProxyHandlerEvent.js";

const defineProperty = (
  mock: Nexo.Mock,
  key: Nexo.objectKey,
  descriptor: PropertyDescriptor,
): boolean => {
  const proxy = map.tracables.get(mock);
  const data = map.proxies.get(proxy);

  const { sandbox } = data;
  const scope = data.scope.deref();
  const value = getTarget(descriptor.value, true);

  const event = new ProxyHandlerEvent("defineProperty", proxy, {
    key,
    descriptor,
  });

  scope.emit(event.name, event);

  if (isTraceable(value)) {
    sandbox.set(key, new WeakRef(value));
  } else {
    sandbox.set(key, value);
  }

  return true;
};

export default defineProperty;
