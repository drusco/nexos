import Nexo from "../../lib/types/Nexo.js";
import getProxy from "../getProxy.js";
import isTraceable from "../isTraceable.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";
import map from "../../lib/maps.js";
import cloneModify from "../cloneModify.js";

const descriptorDefaults: PropertyDescriptor = {
  configurable: false,
  enumerable: false,
  writable: false,
};

const defineProperty = (
  wrapper: Nexo.Wrapper,
  key: Nexo.objectKey,
  descriptor: PropertyDescriptor = descriptorDefaults,
): boolean => {
  const proxy = map.tracables.get(wrapper);
  const data = map.proxies.get(proxy);
  const nexo = data.scope;
  const { sandbox } = data;

  descriptor = {
    ...descriptorDefaults,
    ...descriptor,
  };

  const propertyDescriptor = cloneModify(descriptor, false, (value) => {
    if (isTraceable(value)) {
      return getProxy(nexo, value);
    }
    return value;
  });

  const event = new ProxyEvent("defineProperty", {
    target: proxy,
    cancellable: true,
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
