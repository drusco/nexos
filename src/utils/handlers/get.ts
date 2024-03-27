import Nexo from "../../lib/types/Nexo.js";
import { getProxy, getTarget, isTraceable } from "../index.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";
import map from "../../lib/maps.js";

const get = (wrapper: Nexo.Wrapper, key: Nexo.objectKey): unknown => {
  const proxy = map.tracables.get(wrapper);
  const data = map.proxies.get(proxy);
  const { sandbox } = data;
  const scope = data.scope.deref();
  const target = getTarget(data.target);

  let value: unknown;

  const event = new ProxyEvent("get", proxy, { key });

  scope.emit(event.name, event);
  wrapper.emit(event.name, event);

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
        sandbox.set(key, new WeakRef(value));
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
