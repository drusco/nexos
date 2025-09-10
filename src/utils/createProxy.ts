import type * as nx from "../types/Nexo.js";
import getProxyMap from "./getProxyMap.js";
import createHandlers from "../handlers/index.js";
import ProxyWrapper from "./ProxyWrapper.js";
import ProxyCreateEvent from "../events/ProxyCreateEvent.js";
import { createDeferred, resolveWith } from "./deferred.js";
import isProxy from "./isProxy.js";
import isTraceable from "./isTraceable.js";

const createProxy = (
  nexo: nx.Nexo,
  target?: nx.Traceable,
  id?: string,
  anonymous: boolean = false,
): nx.Proxy => {
  // Return existing proxy
  if (isProxy(target)) {
    return target;
  }

  // Return proxy used by the ID
  if (!target && nexo.entries.has(id)) {
    const proxy = nexo.entries.get(id)?.deref();
    if (proxy) return proxy;
  }

  // create new proxy
  // eslint-disable-next-line prefer-const
  let proxyRef: WeakRef<nx.Proxy>;

  const traceable = isTraceable(target);
  const boundFunction = new Function().bind(null);
  const sandbox = Object.setPrototypeOf(boundFunction, null);
  const proxyTarget = target || sandbox;
  const deferred = createDeferred<nx.FunctionLike<[], nx.Proxy>>();

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

  wrapper.setManager(nexo).setTarget(proxyTarget, !traceable).setId(id);

  // link the proxy to it's wrapper
  getProxyMap().set(proxy, wrapper);

  if (anonymous) {
    // Private proxies behave like regular proxies, but they:
    //   1. Do not trigger 'proxy' events.
    //   2. Are not exposed to the nexo instance.
    // This ensures they remain opaque and cannot be traced back.

    return resolveWith(deferred.resolve, proxy);
  }

  // add or update the ID to a proxy reference

  nexo.entries.set(wrapper.id, proxyRef);

  // create and emit a 'proxy' event to the event listeners

  const event = new ProxyCreateEvent({
    target: proxy,
    data: {
      id: wrapper.id,
      target: wrapper.target,
      result: deferred.promise,
    },
  });

  // check whether the event got prevented
  if (event.defaultPrevented) {
    const { returnValue } = event;

    if (isProxy(returnValue) && returnValue !== proxy) {
      // revoke the original proxy in the event
      revoke();
      // remove the original proxy from the maps
      getProxyMap().delete(proxy);
      nexo.entries.delete(wrapper.id);
      // add or update the ID to the returned proxy
      nexo.entries.set(
        getProxyMap().get(returnValue).id,
        new WeakRef(returnValue),
      );

      // return a different proxy object
      return resolveWith(deferred.resolve, returnValue);
    }
  }

  return resolveWith(deferred.resolve, proxy);
};

export default createProxy;
