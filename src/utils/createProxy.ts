import Exotic from "../types/Exotic";
import map from "./map";
import findProxy from "./findProxy";
import isTraceable from "./isTraceable";
import { globalKey } from "./constants";
import mockPrototype from "./mockPrototype";
import traps from "./traps";

const createProxy = (
  scope: Exotic.Emulator,
  target: any,
  binding: Exotic.key = globalKey,
  origin?: Exotic.proxy.origin, // the action used to create the proxy
): Exotic.Proxy => {
  // target is already a proxy; no proxy out of proxy; no duplicates
  const currentProxy = findProxy(target);
  if (currentProxy) return currentProxy;

  const data: Exotic.emulator.data = map.emulators.get(scope);
  const { keys } = data;

  const id = ++data.totalProxies;
  const mock = function mock() {} as Exotic.Mock;

  const traceable = isTraceable(target);
  const { proxy, revoke } = Proxy.revocable<Exotic.Proxy>(
    Object.setPrototypeOf(mock, mockPrototype),
    traps,
  );

  let group: Exotic.proxy.group = keys[binding];

  if (!group) {
    // create the new group
    group = {
      length: 0,
      root: proxy,
    };

    keys[binding] = group;
    scope.emit("bind", binding);
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
    binding,
  };

  scope.emit("proxy", {
    id,
    proxy,
    origin,
    binding,
  });

  group.length += 1;
  data.activeProxies += 1;

  map.mocks.set(mock, proxy);
  map.proxies.set(proxy, proxyData);

  if (traceable) {
    map.targets.set(target, proxy);
  }

  return proxy;
};

export default createProxy;
