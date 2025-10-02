import isProxy from "./isProxy.js";
import getProxyMap from "./getProxyMap.js";
import { createDeferred, resolveWith } from "./deferred.js";
import Event from "../events/Event.js";

const emitProxy = (proxy: nx.Proxy): nx.Proxy => {
  if (!isProxy(proxy)) return;

  const deferred = createDeferred<nx.FunctionLike<[], nx.Proxy>>();
  const proxyMap = getProxyMap();
  const wrapper = proxyMap.get(proxy);

  const event = new Event("proxy", {
    target: proxy,
    data: {
      id: wrapper.id,
      target: wrapper.target,
      result: deferred.promise,
    },
  }) as nx.ProxyCreateEvent;

  // Emit the proxy event to its listeners on the proxy manager
  wrapper?.manager?.events?.emit("proxy", event);

  // check whether the event got prevented
  if (event.defaultPrevented) {
    const { returnValue } = event;

    if (isProxy(returnValue) && returnValue !== proxy) {
      // get the new proxy wrapper
      const returnedProxyWrapper = proxyMap.get(returnValue);
      // revoke the original proxy in the event
      wrapper.revoke();
      // remove the original proxy from the maps
      proxyMap.delete(proxy);
      returnedProxyWrapper?.manager?.entries.delete(wrapper.id);
      // add or update the ID to the returned proxy
      returnedProxyWrapper?.manager?.entries.set(
        proxyMap.get(returnValue).id,
        new WeakRef(returnValue),
      );

      // return a different proxy object
      return resolveWith(deferred.resolve, returnValue);
    }
  }

  return resolveWith(deferred.resolve, proxy);
};

export default emitProxy;
