import Nexo from "../../lib/types/Nexo.js";
import { getTarget, isTraceable } from "../index.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";
import map from "../../lib/maps.js";

const defineProperty = (
  wrapper: Nexo.Wrapper,
  key: Nexo.objectKey,
  descriptor: PropertyDescriptor,
): boolean => {
  const proxy = map.tracables.get(wrapper);
  const data = map.proxies.get(proxy);

  const { sandbox } = data;
  const scope = data.scope.deref();
  const value = getTarget(descriptor.value, true);

  const event = new ProxyEvent("defineProperty", proxy, {
    key,
    descriptor,
  });

  scope.emit(event.name, event);
  wrapper.emit(event.name, event);

  if (isTraceable(value)) {
    sandbox.set(key, new WeakRef(value));
  } else {
    sandbox.set(key, value);
  }

  return true;
};

export default defineProperty;
