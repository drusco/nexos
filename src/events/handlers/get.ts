import Nexo from "../../types/Nexo.js";
import { getProxy, getTarget, isTraceable, map } from "../../utils/index.js";

const get = (mock: Nexo.Mock, key: Nexo.objectKey): unknown => {
  const proxy = map.tracables.get(mock);
  const data = map.proxies.get(proxy);
  const { sandbox, scope } = data;

  // const origin: Nexo.proxy.origin.get = {
  //   name: "get",
  //   proxy,
  //   key,
  // };

  let value: unknown;
  const target = getTarget(data.target);

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

  return getProxy(scope.deref(), value);
};

export default get;
