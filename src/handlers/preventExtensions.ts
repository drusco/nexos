import ProxyEvent from "../events/ProxyEvent.js";
import { createDeferred, rejectWith, resolveWith } from "../utils/deferred.js";
import getProxyWrapper from "../utils/getProxyWrapper.js";
import ProxyError from "../utils/ProxyError.js";

/**
 * Handles the `preventExtensions` trap for a proxy, emitting a cancelable event
 * to allow external listeners to intervene in the operation.
 *
 * If the event is cancelled, the trap must return `false` or `undefined` to remain
 * compliant with JavaScript's proxy invariants.
 *
 * If a `sandbox` is defined, it will also be marked as non-extensible.
 *
 * Emits a `ProxyPreventExtensionsEvent` and resolves or rejects based on the result
 * and conformance with proxy invariants.
 */
export default function preventExtensions(resolveProxy: nx.resolveProxy) {
  return (target: nx.Traceable): boolean => {
    const proxy = resolveProxy();
    const wrapper = getProxyWrapper(proxy);
    const deferred = createDeferred<nx.FunctionLike<[], boolean>>();

    const event = new ProxyEvent("preventExtensions", {
      target: proxy,
      data: {
        target,
        result: deferred.promise,
      },
    }) as nx.ProxyPreventExtensionsEvent;

    // Emit the proxy event to its listeners on the proxy manager
    wrapper?.manager?.events?.emit("proxy.preventExtensions", event);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.events?.emit("proxy.preventExtensions", event);

    if (event.defaultPrevented) {
      const returnValue = event.returnValue || false;

      if (returnValue !== false) {
        return rejectWith(
          deferred.resolve,
          new ProxyError(
            `'preventExtensions' trap must return false or undefined when cancelled`,
            proxy,
          ),
        );
      }

      return resolveWith(deferred.resolve, returnValue);
    }

    return resolveWith(deferred.resolve, Reflect.preventExtensions(target));
  };
}
