import Nexo from "../../lib/types/Nexo.js";
import getProxy from "../getProxy.js";
import isTraceable from "../isTraceable.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";
import map from "../../lib/maps.js";
import cloneOrModify from "../cloneOrModify.js";

const defineProperty = (
  wrapper: Nexo.Wrapper,
  key: Nexo.objectKey,
  descriptor: PropertyDescriptor = {
    configurable: false,
    enumerable: false,
    writable: false,
  },
): boolean => {
  const proxy = map.tracables.get(wrapper);
  const data = map.proxies.get(proxy);
  const nexo = data.scope.deref();
  const { sandbox } = data;

  const propertyDescriptor = cloneOrModify(descriptor, (value: unknown) => {
    if (isTraceable(value)) {
      return getProxy(nexo, value);
    }

    return value;
  });

  const event = new ProxyEvent("defineProperty", {
    target: proxy,
    data: {
      key,
      descriptor: propertyDescriptor,
    },
  });

  nexo.emit(event.name, event);
  wrapper.emit(event.name, event);

  if (event.defaultPrevented) {
    return false;
  }

  sandbox.set(key, propertyDescriptor);

  return true;
};

export default defineProperty;
