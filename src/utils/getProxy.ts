import getProxyMap from "./getProxyMap.js";
import createHandlers from "../handlers/index.js";
import ProxyWrapper from "./ProxyWrapper.js";
import isProxy from "./isProxy.js";
import isTraceable from "./isTraceable.js";

function getProxy(target?: null): nx.Proxy;
function getProxy<T extends object>(target?: T): nx.ProxyTarget<T>;
function getProxy<T extends object>(target?: T): nx.ProxyTarget<T> {
  // Return existing proxy
  if (isProxy(target)) {
    return target as nx.ProxyTarget<T>;
  }

  // create new proxy
  // eslint-disable-next-line prefer-const
  let proxyRef: WeakRef<nx.Proxy>;

  const traceable = isTraceable(target);
  const boundFunction = new Function().bind(null);
  const sandbox = Object.setPrototypeOf(boundFunction, null);
  const proxyTarget = target || sandbox;

  const { proxy, revoke } = Proxy.revocable<nx.Proxy>(
    proxyTarget,
    createHandlers(() => proxyRef.deref()),
  );

  proxyRef = new WeakRef(proxy);

  if (!traceable) {
    // Remove function related properties for proxies without traceable target
    for (const key of Reflect.ownKeys(sandbox)) {
      const descriptor = Object.getOwnPropertyDescriptor(sandbox, key);
      if (descriptor.configurable) {
        delete sandbox[key];
      }
    }
  }

  // create a proxy wrapper to interact with the proxy
  const wrapper = new ProxyWrapper(revoke);

  wrapper.setTarget(proxyTarget, traceable);

  // link the proxy to it's wrapper
  getProxyMap().set(proxy, wrapper);

  return proxy as nx.ProxyTarget<T>;
}

export default getProxy;
