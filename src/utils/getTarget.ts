import findProxy from "./findProxy.js";
import map from "./maps.js";

const getTarget = (value: unknown, resolveProxy: boolean = false): unknown => {
  const proxy = findProxy(value);

  if (!proxy) {
    // returns a value that is not linked to a proxy in any way
    return value;
  }

  if (proxy && resolveProxy) {
    // returns a proxy that is linked to the received value
    return proxy;
  }

  const { target } = map.proxies.get(proxy);

  if (target) {
    // returns a target from a proxy that is linked to the received value
    return target;
  }
};

export default getTarget;
