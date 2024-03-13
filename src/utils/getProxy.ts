import Nexo from "../types/Nexo.js";
import map from "./map.js";
import findProxy from "./findProxy.js";
import isTraceable from "./isTraceable.js";
import handlers from "../handlers/index.js";

const getProxy = (scope: Nexo, target: Nexo.traceable | void): Nexo.Proxy => {
  // find proxy by target

  const usableProxy = findProxy(target);

  if (usableProxy) {
    return usableProxy;
  }

  // create proxy

  const traceable = isTraceable(target);
  const data: Nexo.data = map.emulators.get(scope);
  const { proxyMap } = data;
  const mock: Nexo.Mock = function () {};
  const proxy = new Proxy(mock, handlers) as Nexo.Proxy;

  // set information about this proxy

  const proxyId = `${++data.counter}`;

  const proxyData: Nexo.proxy.data = {
    id: proxyId,
    target: traceable ? new WeakRef(target) : target,
    scope: new WeakRef(scope),
    sandbox: new Map(),
  };

  map.proxies.set(proxy, proxyData);
  map.tracables.set(mock, proxy);

  if (traceable) {
    map.tracables.set(target, proxy);
  }

  proxyMap.set(proxyId, new WeakRef(proxy));

  return proxy;
};

export default getProxy;
