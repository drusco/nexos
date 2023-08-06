import Exotic from "../types/Exotic";
import map from "./map";
import findProxy from "./findProxy";
import isTraceable from "./isTraceable";
import { symbols } from "./constants";
import mockPrototype from "./mockPrototype";
import traps from "./traps";

const createProxy = (
  scope: Exotic.Emulator,
  target: any,
  refKey: Exotic.key = symbols.GLOBAL,
  origin?: Exotic.proxy.origin, // the action used to create the proxy
): Exotic.Proxy => {
  // target is already a proxy; no proxy out of proxy; no duplicates
  const currentProxy = findProxy(target);
  if (currentProxy) return currentProxy;

  const data: Exotic.emulator.data = map.emulators.get(scope);
  const { refs, firstProxy, lastProxy } = data;

  const id = ++data.totalProxies;
  const mock = function mock() {} as Exotic.Mock;
  const traceable = isTraceable(target);
  let proxyRef: Exotic.Proxy | undefined = refs[refKey];

  const { proxy, revoke } = Proxy.revocable<Exotic.Proxy>(
    Object.setPrototypeOf(mock, mockPrototype),
    traps,
  );

  if (!firstProxy) {
    data.firstProxy = proxy;
  }

  if (traceable) {
    map.targets.set(target, proxy);
  }

  if (!proxyRef) {
    // create the new reference
    proxyRef = proxy;
    refs[refKey] = proxyRef;
    scope.emit("bind", refKey);
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
    refKey,
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
