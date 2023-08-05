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
  const { refs } = data;

  const id = ++data.totalProxies;
  const mock = function mock() {} as Exotic.Mock;
  let group: Exotic.proxy.group = refs[refKey];
  const traceable = isTraceable(target);

  const { proxy, revoke } = Proxy.revocable<Exotic.Proxy>(
    Object.setPrototypeOf(mock, mockPrototype),
    traps,
  );

  if (traceable) {
    map.targets.set(target, proxy);
  }

  if (!group) {
    // create the new group
    group = {
      root: proxy,
      last: proxy,
    };

    refs[refKey] = group;
    scope.emit("bind", refKey);
  }

  const previousProxy = group.last === proxy ? undefined : group.last;
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
    prev: previousProxy,
    next: undefined,
    revoked: false,
  };

  if (previousProxy) {
    // update previous proxy
    const prevData = map.proxies.get(previousProxy);
    if (prevData) {
      prevData.next = proxy;
    }
  }

  scope.emit("proxy", {
    id,
    proxy,
    origin,
    ref: refKey,
  });

  group.last = proxy;
  data.activeProxies += 1;

  map.mocks.set(mock, proxy);
  map.proxies.set(proxy, proxyData);

  return proxy;
};

export default createProxy;
