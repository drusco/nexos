import type nx from "../types/Nexo.js";
import getProxy from "../utils/getProxy.js";
import isTraceable from "../utils/isTraceable.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import cloneModify from "../utils/cloneModify.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

const descriptorDefaults: PropertyDescriptor = {
  configurable: false,
  enumerable: false,
  writable: false,
};

const defineProperty = (
  fn: nx.voidFunction,
  key: nx.objectKey,
  descriptor: PropertyDescriptor = descriptorDefaults,
): boolean => {
  const proxy = map.tracables.get(fn);
  const wrapper = new ProxyWrapper(proxy);
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

  nexo.events.emit(event.name, event);
  wrapper.events.emit(event.name, event);

  if (event.defaultPrevented) {
    return false;
  }

  sandbox.set(key, propertyDescriptor);

  return true;
};

export default defineProperty;
