import Exotic from "../types/Exotic";
import findProxy from "./findProxy";
import map from "./map";

const revokeProxy = (
  scope: Exotic.Emulator,
  value: Exotic.traceable,
): boolean => {
  const proxy = findProxy(value);
  if (!proxy) return false;

  const proxyData = map.proxies.get(proxy);

  if (proxyData.revoked) return true;

  const data = map.emulators.get(scope);
  const { refs } = data;
  const { id, mock, revoke, target, origin } = proxyData;
  const hasRefKey = proxyData.refKey !== undefined;

  if (hasRefKey) {
    // refKey is binded to proxy
    // delete refKey from refs object
    delete refs[proxyData.refKey];
    // delete refKey from proxy
    proxyData.refKey = undefined;
    // inform
    scope.emit("unbind", proxyData.refKey);
  }

  if (origin) {
    // remove from proxy's parent references
    const { action, key, proxy: parentProxy } = origin;
    if (action === "get" || action === "set") {
      // delete from parent proxy and target
      if (parentProxy) delete parentProxy[key];
    }
  }

  map.mocks.delete(mock);
  map.targets.delete(target);

  // keep in proxies map
  // prevents proxy out of revoked proxy (throws error)
  //map.proxies.delete(proxy);

  revoke();

  proxyData.revoked = true;
  data.activeProxies -= 1;

  if (data.activeProxies === 0) {
    // clean internal state
    Object.assign(data, {
      firstProxy: undefined,
      lastProxy: undefined,
      refs: Object.create(null),
    });
  }

  scope.emit("revoke", id);
  return true;
};

export default revokeProxy;
