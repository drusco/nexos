import Exotic from "../types/Exotic.js";
import findProxy from "./findProxy.js";
import map from "./map.js";

const revokeProxy = (value: Exotic.traceable): boolean => {
  const proxy = findProxy(value);

  if (!proxy) {
    return false;
  }

  const proxyData = map.proxies.get(proxy);
  const { id, mock, revoke, target, origin, revoked, key, scope } = proxyData;

  if (revoked) {
    return true;
  }

  const data = map.emulators.get(scope);
  const { links, proxySet, options } = data;

  if (key !== undefined) {
    // the key is linked to a proxy
    // delete this key from the links
    delete links[key];
  }

  // remove from proxy's parent references
  const { action, key: property, proxy: parentProxy } = origin;
  if (action === "get" || action === "set") {
    // delete from parent proxy and target
    const parentProxyData = map.proxies.get(parentProxy);
    if (!parentProxyData?.revoked) {
      delete parentProxy[property];
    }
  }

  map.mocks.delete(mock);
  map.targets.delete(target);
  proxySet.delete(proxy);
  delete links[`⁠${id}`];

  revoke();

  // !! keep in proxies map
  // prevent proxy out of revoked proxy error

  map.proxies.set(proxy, {
    id,
    revoked: true,
    mock: null,
    revoke: null,
    sandbox: null,
    scope: null,
  });

  if (proxySet.size === 0) {
    // clean internal state
    map.emulators.set(scope, {
      options,
      proxySet,
      links: Object.create(null),
      counter: 0,
    });
  }

  return true;
};

export default revokeProxy;
