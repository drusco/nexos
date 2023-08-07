import Exotic from "../types/Exotic";
import map from "./map";
import findProxy from "./findProxy";
import isTraceable from "./isTraceable";
import mockPrototype from "./mockPrototype";
import traps from "./traps";

const createProxy = (
  scope: Exotic.Emulator,
  target: any,
  origin?: Exotic.proxy.origin, // the action used to create the proxy
  refKey?: Exotic.key,
): Exotic.Proxy => {
  // target is already a proxy; no proxy out of proxy; no duplicates
  const usableProxy = findProxy(target);

  if (usableProxy) return usableProxy;

  const data: Exotic.emulator.data = map.emulators.get(scope);
  const { refs, firstProxy, lastProxy } = data;
  const validRef = refKey !== undefined;
  const newRef = validRef ? refKey : undefined;

  if (validRef) {
    const refProxy = refs[refKey];
    if (refProxy) return refProxy;
  }

  const id = ++data.totalProxies;
  const mock = function mock() {} as Exotic.Mock;
  const traceable = isTraceable(target);

  const { proxy, revoke } = Proxy.revocable<Exotic.Proxy>(
    Object.setPrototypeOf(mock, mockPrototype),
    traps,
  );

  if (!firstProxy) data.firstProxy = proxy;
  if (traceable) map.targets.set(target, proxy);

  if (validRef) {
    // create the new reference
    refs[refKey] = proxy;
    scope.emit("bind", refKey, proxy);
  }

  // set the proxy information
  const proxyData: Exotic.proxy.data = {
    id,
    mock,
    origin,
    target,
    revoke,
    scope,
    sandbox: Object.create(null),
    refKey: newRef,
    prev: lastProxy,
    next: undefined,
    revoked: false,
  };

  if (lastProxy) {
    // update previous proxy
    const lastProxyData = map.proxies.get(lastProxy);
    if (lastProxyData) {
      lastProxyData.next = proxy;
    }
  }

  scope.emit("proxy", {
    id,
    proxy,
    origin,
    ref: refKey,
  });

  data.lastProxy = proxy;
  data.activeProxies += 1;

  map.mocks.set(mock, proxy);
  map.proxies.set(proxy, proxyData);

  return proxy;
};

export default createProxy;
