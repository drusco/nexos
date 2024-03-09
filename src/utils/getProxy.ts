import Nexo from "../types/Nexo.js";
import map from "./map.js";
import findProxy from "./findProxy.js";
import isTraceable from "./isTraceable.js";
import traps from "./traps/index.js";
import getTarget from "./getTarget.js";

const getProxy = (scope: Nexo.Emulator, target?: unknown): Nexo.Proxy => {
  // find proxy by target

  const targetValue = getTarget(target, true);
  const usableProxy = findProxy(targetValue);

  if (usableProxy) {
    return usableProxy;
  }

  // create proxy

  const traceable = isTraceable(targetValue);
  const data: Nexo.emulator.data = map.emulators.get(scope);
  const { proxyMap } = data;
  const mock: Nexo.Mock = function () {};
  const proxy = new Proxy<Nexo.Proxy>(mock as Nexo.Proxy, traps);

  // set information about this proxy

  const proxyId = `${++data.counter}`;

  const proxyData: Nexo.proxy.data = {
    id: proxyId,
    target: traceable ? new WeakRef(targetValue) : targetValue,
    scope: new WeakRef(scope),
    sandbox: new Map(),
  };

  map.proxies.set(proxy, proxyData);
  map.tracables.set(mock, proxy);

  if (traceable) {
    map.tracables.set(targetValue, proxy);
  }

  proxyMap.set(proxyId, new WeakRef(proxy));

  return proxy;
};

export default getProxy;
