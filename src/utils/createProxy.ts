import type * as nx from "../types/Nexo.js";
import getProxyMap from "./getProxyMap.js";
import ProxyCreateEvent from "../events/ProxyCreateEvent.js";
import { createDeferred, resolveWith } from "./deferred.js";
import isProxy from "./isProxy.js";
import getProxy from "./getProxy.js";

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

  const proxy = getProxy(target);
  const proxyRef = new WeakRef(proxy);
  const proxyMap = getProxyMap();
  const wrapper = proxyMap.get(proxy);

  wrapper.setManager(nexo).setId(id);

  if (anonymous) {
    // Private proxies behave like regular proxies, but they:
    //   1. Do not trigger 'proxy' events.
    //   2. Are not exposed to the nexo instance.
    // This ensures they remain opaque and cannot be traced back.

    return proxy;
  }

  // add or update the ID to a proxy reference

  nexo.entries.set(wrapper.id, proxyRef);

  // create and emit a 'proxy' event to the event listeners

  const deferred = createDeferred<nx.FunctionLike<[], nx.Proxy>>();

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
      wrapper.revoke();
      // remove the original proxy from the maps
      proxyMap.delete(proxy);
      nexo.entries.delete(wrapper.id);
      // add or update the ID to the returned proxy
      nexo.entries.set(proxyMap.get(returnValue).id, new WeakRef(returnValue));

      // return a different proxy object
      return resolveWith(deferred.resolve, returnValue);
    }
  }

  return resolveWith(deferred.resolve, proxy);
};

export default createProxy;
