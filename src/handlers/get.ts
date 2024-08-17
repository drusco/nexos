import type nx from "../types/Nexo.js";
import getProxy from "../utils/getProxy.js";
import getTarget from "../utils/getTarget.js";
import isTraceable from "../utils/isTraceable.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

const get = (fn: nx.voidFunction, property: nx.objectKey): unknown => {
  const proxy = map.tracables.get(fn);
  const data = map.proxies.get(proxy);
  const wrapper = new ProxyWrapper(proxy);
  const { sandbox } = data;
  const target = wrapper.target;

  let value: unknown;

  const event = new ProxyEvent("get", {
    target: proxy,
    cancellable: true,
    data: { property },
  });

  // Event listeners can modify the value to return
  if (event.defaultPrevented) {
    return event.returnValue;
  }

  try {
    // get value from the original target
    value = getTarget(target[property], true);
  } catch (error) {
    // target is untraceable
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
