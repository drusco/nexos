import Exotic from "../types/Exotic";
import map from "./map";
import findProxy from "./findProxy";
import isTraceable from "./isTraceable";
import { globalNamespace } from "./constants";
import traps from "./traps";

const createProxy = (
  scope: Exotic.Emulator,
  target: any,
  namespace: Exotic.namespace = globalNamespace,
  origin?: Exotic.proxy.origin, // the action used to create the proxy
): Exotic.Proxy => {
  // target is already a proxy; no proxy out of proxy; no duplicates
  const currentProxy = findProxy(target);
  if (currentProxy) return currentProxy;

  const data: Exotic.emulator.data = map.emulators.get(scope);
  const { bindings } = data;

  const id = ++data.itemCount;
  const dummy: Exotic.FunctionLike = function () {};
  const traceable = isTraceable(target);
  const { proxy, revoke } = Proxy.revocable<Exotic.Proxy>(dummy, traps);

  let group: Exotic.proxy.group = bindings[namespace];

  if (!group) {
    // create the new group
    group = {
      length: 0,
      first: proxy,
      last: proxy,
    };

    bindings[namespace] = group;
    scope.emit("bind", namespace);
  }

  group.last = proxy;

  // set the proxy information
  const proxyData: Exotic.proxy.data = {
    id,
    dummy,
    origin,
    target,
    revoke,
    scope,
    sandbox: Object.create(null),
    namespace,
  };

  scope.emit("proxy", {
    id,
    proxy,
    origin,
    namespace,
  });

  group.length += 1;
  data.activeItems += 1;

  map.dummies.set(dummy, proxy);
  map.proxies.set(proxy, proxyData);

  if (traceable) {
    map.targets.set(target, proxy);
  }

  return proxy;
};

export default createProxy;
