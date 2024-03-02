import Exotic from "../types/Exotic.js";
import map from "./map.js";
import findProxy from "./findProxy.js";
import isTraceable from "./isTraceable.js";
import isProxyPayload from "./isProxyPayload.js";
import mockPrototype from "./mockPrototype.js";
import traps from "./traps/index.js";
import findProxyById from "./findProxyById.js";

const tryProxy = <Target>(
  scope: Exotic.Emulator,
  target?: Target,
): Target | Exotic.Proxy => {
  const data: Exotic.emulator.data = map.emulators.get(scope);
  const { proxyMap } = data;

  // find proxy by proxyPayload

  if (isProxyPayload(target)) {
    const proxyById = findProxyById(scope, target);

    if (proxyById) {
      return proxyById;
    }
  }

  // find proxy by target

  const usableProxy = findProxy(target);

  if (usableProxy) {
    return usableProxy;
  }

  // exclude non traceable targets

  if (!isTraceable(target)) {
    return target as Target;
  }

  // create a new proxy

  const mock: Exotic.Mock = Object.setPrototypeOf(
    function () {},
    mockPrototype,
  );

  const { proxy, revoke } = Proxy.revocable<Exotic.Proxy>(
    mock as Exotic.Proxy,
    traps,
  );

  // add information about this proxy
  const proxyData: Exotic.proxy.data = {
    id: `${++data.counter}`,
    mock,
    target,
    scope,
    revoked: false,
    sandbox: Object.create(null),
    revoke,
  };

  map.mocks.set(mock, proxy);
  map.proxies.set(proxy, proxyData);
  map.targets.set(target, proxy);

  proxyMap.set(proxyData.id, new WeakRef(proxy));

  return proxy;
};

export default tryProxy;
