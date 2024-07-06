import type nx from "../types/Nexo.js";
import getProxy from "../utils/getProxy.js";
import getTarget from "../utils/getTarget.js";
import isTraceable from "../utils/isTraceable.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

const get = (fn: nx.voidFunction, key: nx.objectKey): unknown => {
  const proxy = map.tracables.get(fn);
  const data = map.proxies.get(proxy);
  const { sandbox } = data;
  const scope = data.nexo;
  const target = getTarget(data.target);
  const wrapper = new ProxyWrapper(proxy);

  let value: unknown;

  const event = new ProxyEvent("get", { target: proxy, data: { key } });

  scope.events.emit(event.name, event);
  wrapper.events.emit(event.name, event);

  if (event.defaultPrevented) {
    return event.returnValue;
  }

  try {
    // get value from the original target
    value = getTarget(target[key], true);
  } catch (error) {
    // target is untraceable
  }

  if (sandbox.has(key)) {
    const savedValue = getTarget(sandbox.get(key), true);

    if (savedValue !== value) {
      // original value changed

      if (isTraceable(value)) {
        // sandbox.set(key, new WeakRef(value));
      } else {
        sandbox.set(key, value);
      }
    }

    return getTarget(sandbox.get(key), true);
  }

  // proxy's handler.set was not called ever
  // proxy's handler.get is being called for the first time

  if (!isTraceable(value)) {
    return value;
  }

  return getProxy(scope, value);
};

export default get;
