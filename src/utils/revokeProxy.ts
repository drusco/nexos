import Exotic from "../types/Exotic.js";
import decode from "./decode.js";
import findProxy from "./findProxy.js";
import map from "./map.js";

const revokeProxy = (value: Exotic.traceable): boolean => {
  const proxy = findProxy(value);

  if (!proxy) {
    return false;
  }

  const proxyData = map.proxies.get(proxy);
  const { mock, revoke, target, origin, revoked, key, scope } = proxyData;

  if (revoked) {
    return true;
  }

  const data = map.emulators.get(scope);
  const { refs, proxySet } = data;
  const validKey = key !== undefined;

  if (validKey) {
    // key is binded to proxy
    // delete key from refs object
    delete refs[key];
    // delete key from proxy
    proxyData.key = undefined;
  }

  const decodedOrigin = decode(scope, origin) as Exotic.proxy.origin;

  if (decodedOrigin) {
    // remove from proxy's parent references
    const { action, key, proxy: parentProxy } = decodedOrigin;
    if (action === "get" || action === "set") {
      // delete from parent proxy and target
      if (parentProxy) {
        const data = map.proxies.get(parentProxy);
        if (data && !data.revoked) {
          delete parentProxy[key];
        }
      }
    }
  }

  map.mocks.delete(mock);
  map.targets.delete(target);
  proxySet.delete(proxy);

  // keep in proxies map
  // prevents proxy out of revoked proxy (throws)
  //map.proxies.delete(proxy);

  revoke();

  Object.assign(proxyData, {
    revoked: true,
    mock: null,
    origin: null,
    revoke: null,
    sandbox: null,
    scope: null,
    target: null,
  } as Exotic.proxy.data);

  if (proxySet.size === 0) {
    // clean internal state
    Object.assign(data, {
      refs: Object.create(null),
    });
  }

  return true;
};

export default revokeProxy;
