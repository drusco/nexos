import type nx from "../types/Nexo.js";
import getProxy from "../utils/getProxy.js";
import isTraceable from "../utils/isTraceable.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";

const get = (target: nx.traceable, property: nx.objectKey): unknown => {
  const proxy = map.tracables.get(target);
  const { sandbox, wrapper, traceable } = map.proxies.get(proxy);

  let value: unknown;

  const event = new ProxyEvent("get", {
    target: proxy,
    cancelable: true,
    data: { property },
  });

  // Event listeners can modify the value to return
  if (event.defaultPrevented) {
    return event.returnValue;
  }

  if (traceable) {
    try {
      // get value from the original target
      value = target[property];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // target is untraceable
    }
  }

  if (sandbox.has(property)) {
    const descriptor = sandbox.get(property);
    return descriptor.value;
  }

  // proxy's handler.set was not called ever
  // proxy's handler.get is being called for the first time

  if (!isTraceable(value)) {
    return value;
  }

  return getProxy(wrapper.nexo, value);
};

export default get;
