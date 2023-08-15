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
  const { refs } = data;
  const validRefKey = refKey !== undefined;
  const reference = validRefKey ? refKey : undefined;

  if (validRefKey) {
    // proxy reference exists
    const proxyRef = refs[reference];
    if (proxyRef) {
      return proxyRef;
    }
  }

  // create new proxy

  const mock = Object.setPrototypeOf(
    function () {},
    mockPrototype,
  ) as Exotic.Mock;

  let { proxy, revoke } = Proxy.revocable<Exotic.Proxy>(mock, traps);

  const id = ++data.totalProxies;
  const sandbox = Object.create(null);

  const revokeFunction = () => {
    revoke && revoke();
    proxy = null;
    revoke = null;
  };

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
    revoke: revokeFunction,
    scope,
    sandbox,
    key: reference,
    revoked: false,
  };

  data.activeProxies += 1;

  map.mocks.set(mock, proxy);
  map.proxies.set(proxy, proxyData);
  map.proxySet.add(proxy);

  if (isTraceable(target)) {
    map.targets.set(target, proxy);
  }

  return proxy;
};

export default createProxy;
