import findProxy from "./findProxy.js";
import map from "./map.js";

const getTarget = (value: unknown, getProxy: boolean = false): unknown => {
  const proxy = findProxy(value);

  if (!proxy) {
    return value;
  }

  if (proxy && getProxy) {
    return proxy;
  }

  const { target } = map.proxies.get(proxy);

  if (target) {
    return target.deref();
  }
};

export default getTarget;
