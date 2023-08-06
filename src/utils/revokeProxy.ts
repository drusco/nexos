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
  const { refs } = data;

  let { refKey } = proxyData;
  let proxyRef = refs[refKey];

  const { id, mock, revoke, target, origin } = proxyData;

  if (proxyRef === proxy) {
    // proxy is linked to refKey
    // delete refKey from proxy
    proxyData.refKey = undefined;
    // delete refKey from proxies created after this proxy
    for (const proxyUsingRef of scope.entriesAfter(proxy)) {
      const refData = map.proxies.get(proxyUsingRef);
      if (refData.refKey === refKey) {
        refData.refKey = undefined;
      }
    }
    // delete refKey from refs object
    delete refs[refKey];
    // delete from variable
    refKey = undefined;
    proxyRef = undefined;
    // inform
    scope.emit("unbind", refKey);
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
