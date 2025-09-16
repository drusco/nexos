import type * as nx from "../types/Nexo.js";
import getProxyMap from "./getProxyMap.js";
import getProxy from "./getProxy.js";
import emitProxy from "./emitProxy.js";

const createProxy = (
  nexo: nx.Nexo,
  target?: nx.Traceable,
  id?: string,
  anonymous: boolean = false,
): nx.Proxy => {
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

  return emitProxy(proxy);
};

export default createProxy;
