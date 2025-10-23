import ProxyEvent from "../events/ProxyEvent.js";
import { createDeferred, resolveWith } from "../utils/deferred.js";
import getProxy from "../utils/getProxy.js";
import getProxyWrapper from "../utils/getProxyWrapper.js";

/**
 * Implements the `get` trap for a Proxy, enabling interception of property access.
 *
 * Emits a cancelable `"get"` event to allow listeners to modify or override the result.
 * If the event is prevented, the resolved `returnValue` is returned instead.
 *
 * When no sandbox is defined, property access is delegated directly to the target.
 * If a sandbox exists, it is checked first for the property before falling back to a fallback proxy creation.
 *
 * Ensures all outcomes are funneled through a deferred promise resolution for consistency.
 */
export default function get(resolveProxy: nx.ResolveProxy) {
  return (target: object, property: nx.ObjectKey): unknown => {
    const proxy = resolveProxy();
    const wrapper = getProxyWrapper(proxy);
    const { manager } = wrapper;
    const deferred = createDeferred<nx.FunctionLike<[], unknown>>();

    const event = new ProxyEvent("get", {
      target: proxy,
      data: {
        target,
        property,
        result: deferred.promise,
      },
    }) as nx.ProxyGetEvent;

    // Emit the proxy event to its listeners on the proxy manager
    wrapper?.manager?.events?.emit("proxy.get", event);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.events?.emit("proxy.get", event);

    if (event.defaultPrevented) {
      return resolveWith(deferred.resolve, event.returnValue);
    }

    if (Reflect.has(target, property)) {
      // return existing value on the target or sandbox
      return resolveWith(deferred.resolve, Reflect.get(target, property));
    }

    // create a new managed proxy
    if (manager) {
      return resolveWith(deferred.resolve, manager.create());
    }

    // create a new unmanaged proxy
    return resolveWith(deferred.resolve, getProxy());
  };
}
