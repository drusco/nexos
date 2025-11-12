import getProxyMap from "./getProxyMap.js";
import createHandlers from "../handlers/index.js";
import ProxyWrapper from "./ProxyWrapper.js";
import isProxy from "./isProxy.js";
import isTraceable from "./isTraceable.js";
import getProxyWrapper from "./getProxyWrapper.js";

function getProxy(target: null | undefined, dry: true): nx.DryProxy;
function getProxy(target?: null, dry?: boolean): nx.Proxy;
function getProxy<T extends object>(target: T, dry: true): nx.DryProxy;
function getProxy<T extends object>(
  target?: T,
  dry?: boolean,
): nx.ProxyTarget<T>;

function getProxy<T extends object>(
  target?: T,
  dry: boolean = false,
): nx.ProxyTarget<T> | nx.DryProxy {
  // check if the target is already a proxy
  if (isProxy(target)) {
    if (dry) {
      const wrapper = getProxyWrapper(target);
      // return dry proxy
      return {
        id: wrapper.id,
        target: wrapper.target,
      };
    }
    // return the existing proxy
    return target as nx.ProxyTarget<T>;
  }

  if (dry) {
    // return dry proxy
    return {
      target,
    };
  }

  // create new proxy
  // eslint-disable-next-line prefer-const
  let proxyRef: WeakRef<nx.Proxy>;
  let proxyTarget: object;

  const traceable = isTraceable(target);

  if (traceable) {
    proxyTarget = target;
  } else {
    const boundFunction = new Function().bind(null);
    const sandbox = Object.setPrototypeOf(boundFunction, null);
    proxyTarget = sandbox;
    // Remove function related properties for proxies without traceable target
    for (const key of Reflect.ownKeys(sandbox)) {
      const descriptor = Object.getOwnPropertyDescriptor(sandbox, key);
      if (descriptor.configurable) {
        delete sandbox[key];
      }
    }
  }

  const { proxy, revoke } = Proxy.revocable<nx.Proxy>(
    proxyTarget as nx.Proxy,
    createHandlers(() => proxyRef.deref()),
  );

  proxyRef = new WeakRef(proxy);

  // create a proxy wrapper to interact with the proxy
  const wrapper = new ProxyWrapper(revoke);

  wrapper.setTarget(proxyTarget, traceable);

  // link the proxy to it's wrapper
  getProxyMap().set(proxy, wrapper);

  return proxy as nx.ProxyTarget<T>;
}

export default getProxy;
