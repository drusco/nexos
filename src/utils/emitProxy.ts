import isProxy from "./isProxy.js";
import getProxyMap from "./getProxyMap.js";
import { createDeferred, resolveWith } from "./deferred.js";
import ProxyCreateEvent from "../events/ProxyCreateEvent.js";

const emitProxy = (proxy: nx.Proxy): nx.Proxy => {
  if (!isProxy(proxy)) return;

  const deferred = createDeferred<nx.FunctionLike<[], nx.Proxy>>();
  const proxyMap = getProxyMap();
  const wrapper = proxyMap.get(proxy);

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
      // get the new proxy wrapper
      const returnedProxyWrapper = proxyMap.get(returnValue);
      // revoke the original proxy in the event
      wrapper.revoke();
      // remove the original proxy from the maps
      proxyMap.delete(proxy);
      returnedProxyWrapper?.nexo?.entries.delete(wrapper.id);
      // add or update the ID to the returned proxy
      returnedProxyWrapper?.nexo?.entries.set(
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
