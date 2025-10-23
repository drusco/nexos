import ProxyEvent from "../events/ProxyEvent.js";
import { createDeferred, rejectWith, resolveWith } from "../utils/deferred.js";
import getProxyWrapper from "../utils/getProxyWrapper.js";
import ProxyError from "../utils/ProxyError.js";

/**
 * Proxy trap handler for the `has` operation (used by the `in` operator).
 *
 * This function creates and emits a custom `ProxyHasEvent`, allowing listeners to
 * intercept and optionally override the result of the `in` check on a proxy object.
 *
 * If the event is canceled (`event.preventDefault()`), the provided return value is
 * validated to ensure it's a boolean. If not, a `ProxyError` is thrown.
 *
 * If the event is not canceled, the check is forwarded to either the sandbox
 * or the original target using `Reflect.has`.
 *
 * Deferred resolution is used to allow async inspection of the result via the event's
 * `.data.result` promise.
 *
 */
export default function has(resolveProxy: nx.ResolveProxy) {
  return (target: object, property: nx.ObjectKey): boolean => {
    const proxy = resolveProxy();
    const wrapper = getProxyWrapper(proxy);
    const deferred = createDeferred<nx.FunctionLike<[], boolean>>();

    const event = new ProxyEvent("has", {
      target: proxy,
      data: {
        target,
        property,
        result: deferred.promise,
      },
    }) as nx.ProxyHasEvent;

    // Emit the proxy event to its listeners on the proxy manager
    wrapper?.manager?.events?.emit("proxy.has", event);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.events?.emit("proxy.has", event);

    if (event.defaultPrevented) {
      if (typeof event.returnValue !== "boolean") {
        return rejectWith(
          deferred.resolve,
          new ProxyError(`'has' trap must return a boolean value`, proxy),
        );
      }
      return resolveWith(deferred.resolve, event.returnValue);
    }

    return resolveWith(deferred.resolve, Reflect.has(target, property));
  };
}
