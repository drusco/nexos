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
  const group = refs[refKey];

  if (group.root === proxy) {
    // delete group
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

  scope.emit("revoke", id);
  return true;
};

export default revokeProxy;
