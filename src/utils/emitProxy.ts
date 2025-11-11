import isProxy from "./isProxy.js";
import { createDeferred, resolveWith } from "./deferred.js";
import Event from "../events/Event.js";
import ProxyError from "./ProxyError.js";
import getProxyWrapper from "./getProxyWrapper.js";

const emitProxy = (proxy: object): nx.Proxy => {
  if (!isProxy(proxy)) {
    throw new ProxyError("The provided object is not a valid proxy", proxy);
  }

  const deferred = createDeferred<nx.FunctionLike<[], nx.Proxy>>();
  const wrapper = getProxyWrapper(proxy);

  const event = new Event("proxy", {
    target: proxy,
    cancelable: true,
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
    const { returnValue: newProxy } = event;

    if (isProxy(newProxy) && newProxy !== proxy) {
      // get the new proxy wrapper
      const proxyWrapper = getProxyWrapper(newProxy);
      // revoke the original proxy
      wrapper.revoke();
      // add or update the ID to the returned proxy
      proxyWrapper?.manager?.entries.set(
        proxyWrapper.id,
        new WeakRef(newProxy),
      );

      // return a different proxy object
      return resolveWith(deferred.resolve, newProxy);
    }
  }

  return resolveWith(deferred.resolve, proxy);
};

export default emitProxy;
