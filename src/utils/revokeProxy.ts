import Exotic from "../types/Exotic.js";
import findProxy from "./findProxy.js";
import map from "./map.js";

const revokeProxy = (value: Exotic.traceable): boolean => {
  const proxy = findProxy(value);

  if (!proxy) {
    return false;
  }

  const { id, mock, revoke, target, origin, revoked, scope } =
    map.proxies.get(proxy);

  if (revoked) {
    return true;
  }

  const targetIsFunction = typeof target === "function";
  const data = map.emulators.get(scope);
  const { proxyMap, options } = data;

  // remove from proxy's parent references
  const { action, key: property, proxy: parentProxy } = origin;
  if (action === "get" || action === "set") {
    // delete from parent proxy and target
    const parentProxyData = map.proxies.get(parentProxy);
    if (!parentProxyData?.revoked) {
      delete parentProxy[property];
    }
  }

  // call cleanup function for proxy created with 'exec' action
  if (targetIsFunction && origin.action === "exec") {
    try {
      target();
    } catch (error: any) {
      /* error */
    }
  }

  // remove proxy weak references

  map.mocks.delete(mock);
  map.targets.delete(target);

  // remove proxy strong references

  proxyMap.delete(id);

  // revoke proxy
  revoke();

  // keep weak reference in proxies map
  // prevents proxy out of revoked proxy error

  map.proxies.set(proxy, {
    id,
    revoked: true,
    mock: null,
    revoke: null,
    sandbox: null,
    scope: null,
  });

  if (proxyMap.size === 0) {
    // clean internal state
    map.emulators.set(scope, {
      options,
      proxyMap,
      counter: 0,
    });
  }

  return true;
};

export default revokeProxy;
