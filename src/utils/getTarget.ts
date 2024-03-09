import findProxy from "./findProxy.js";
import unlockRef from "./unlockRef.js";
import map from "./map.js";

const getTarget = (value: unknown, resolveProxy: boolean = false): unknown => {
  value = unlockRef(value);

  const proxy = findProxy(value);

  if (!proxy) {
    return value;
  }

  if (proxy && resolveProxy) {
    return proxy;
  }

  const { target } = map.proxies.get(proxy);

  return unlockRef(target);
};

export default getTarget;
