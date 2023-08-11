import Exotic from "../types/Exotic";
import map from "./map";
import findProxy from "./findProxy";
import isTraceable from "./isTraceable";
import mockPrototype from "./mockPrototype";
import traps from "./traps";

const createProxy = (
  scope: Exotic.Emulator,
  target?: any,
  origin?: Exotic.proxy.origin,
  refKey?: Exotic.key,
): Exotic.Proxy => {
  const usableProxy = findProxy(target);

  if (usableProxy) {
    // proxy already exists
    return usableProxy;
  }

  const data: Exotic.emulator.data = map.emulators.get(scope);
  const { refs, firstProxy, lastProxy } = data;
  const validRefKey = refKey !== undefined;
  const reference = validRefKey ? refKey : undefined;

  if (validRefKey) {
    // proxy reference exists
    const refProxy = refs[reference];
    if (refProxy) {
      return refProxy;
    }
  }

  // create new proxy

  const id = ++data.totalProxies;
  const mock = Object.setPrototypeOf(
    function () {},
    mockPrototype,
  ) as Exotic.Mock;
  const sandbox = Object.create(null);
  const traceable = isTraceable(target);
  const { proxy, revoke } = Proxy.revocable<Exotic.Proxy>(mock, traps);
  const proxyRef = new WeakRef(proxy);

  if (validRefKey) {
    // create unique reference
    refs[reference] = proxy;
  }

  // proxy information
  const proxyData: Exotic.proxy.data = {
    id,
    mock,
    origin,
    target,
    revoke,
    scope,
    sandbox,
    refKey: reference,
    prev: lastProxy,
    next: undefined,
    revoked: false,
  };

  if (lastProxy) {
    // update previous proxy
    const lastProxyData = map.proxies.get(lastProxy.deref());
    if (lastProxyData) {
      lastProxyData.next = proxyRef;
    }
  }

  if (!firstProxy) {
    data.firstProxy = proxyRef;
  }

  data.lastProxy = proxyRef;
  data.activeProxies += 1;

  map.mocks.set(mock, proxyRef);
  map.proxies.set(proxy, proxyData);

  if (traceable) {
    map.targets.set(target, proxyRef);
  }

  return proxy;
};

export default createProxy;
