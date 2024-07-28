import type nx from "../types/Nexo.js";
import getProxy from "../utils/getProxy.js";
import isTraceable from "../utils/isTraceable.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import cloneModify from "../utils/cloneModify.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

const defineProperty = (
  fn: nx.voidFunction,
  key: nx.objectKey,
  descriptor?: PropertyDescriptor,
): boolean => {
  const proxy = map.tracables.get(fn);
  const wrapper = new ProxyWrapper(proxy);
  const data = map.proxies.get(proxy);
  const { sandbox, nexo } = data;

  const event = new ProxyEvent("defineProperty", {
    target: proxy,
    cancellable: true,
    data: {
      key,
      descriptor,
    },
  });

  nexo.events.emit(event.name, event);
  wrapper.events.emit(event.name, event);

  // the property descriptor can be modified by the event listeners
  // by accesing the data.descriptor value.
  // Property definition is cancelled whenever event.preventDefault is called
  if (event.defaultPrevented) {
    return false;
  }

  const propertyDescriptor = cloneModify(descriptor, false, (value) => {
    if (isTraceable(value)) {
      return getProxy(nexo, value);
    }
    return value;
  });

  sandbox.set(key, propertyDescriptor);

  return true;
};

export default defineProperty;
