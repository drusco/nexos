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
  const data = map.emulators.get(scope);

  const { id, refKey, mock, revoke, target, origin } = proxyData;
  const { refs } = data;
  const proxyRef = refs[refKey];

  if (proxyRef === proxy) {
    // delete reference
    delete refs[refKey];
    scope.emit("unbind", refKey);
  }

  // remove item references

  if (origin) {
    const { action, key, proxy: parentProxy } = origin;
    if (action === "get" || action === "set") {
      // delete from parent proxy and target
      if (parentProxy) delete parentProxy[key];
    }
  }

  map.mocks.delete(mock);
  map.targets.delete(target);

  // keep proxy in map
  // to prevent proxy out of revoked proxy (throws error)
  //map.proxies.delete(proxy);

  revoke();

  proxyData.revoked = true;
  data.activeProxies -= 1;

  if (data.activeProxies === 0) {
    // clean internal state
    Object.assign(data, {
      firstProxy: undefined,
      lastProxy: undefined,
      totalProxies: 0,
      refs: Object.create(null),
    });
  }

  scope.emit("revoke", id);
  return true;
};

export default revokeProxy;
