import Exotic from "../types/Emulator";
import map from "./map";
import findProxy from "./findProxy";
import isTraceable from "./isTraceable";
import traps from "./traps";

const createProxy = (
  scope: Exotic.Emulator,
  target: any,
  namespace?: string,
  trap?: Exotic.proxy.origin, // the action used to create the proxy
): Exotic.Proxy => {
  // target is already a proxy; no proxy out of proxy; no duplicates
  const currentProxy = findProxy(target);
  if (currentProxy) return currentProxy;

  const data: Exotic.emulator.private = map.emulators.get(scope);
  const { bindings } = data;

  const itemId = ++data.itemCount;
  const dummy: Exotic.FunctionLike = function () {};
  const traceable = isTraceable(target);
  const { proxy, revoke } = Proxy.revocable(dummy as Exotic.Proxy, traps);
  const group = bindings[namespace];

  // set information about the item

  const item: Exotic.emulator.item = {
    id: itemId,
    dummy,
    origin: trap,
    target,
    revoke,
    scope,
    sandbox: Object.create(null),
    group: group && namespace,
  };

  scope.emit("proxy", {
    id: itemId,
    item: proxy,
    origin: trap,
    group: item.group,
  });

  if (group) {
    group.length += 1;
  }

  data.activeItems += 1;

  map.dummies.set(dummy, proxy);
  map.proxies.set(proxy, item);

  if (traceable) {
    map.targets.set(target, proxy);
  }

  return proxy;
};

export default createProxy;
