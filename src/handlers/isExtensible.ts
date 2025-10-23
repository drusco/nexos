import ProxyEvent from "../events/ProxyEvent.js";
import { createDeferred, rejectWith, resolveWith } from "../utils/deferred.js";
import getProxyWrapper from "../utils/getProxyWrapper.js";
import ProxyError from "../utils/ProxyError.js";

/**
 * Implements the `isExtensible` trap for a proxy handler.
 *
 * Emits a cancelable `ProxyIsExtensibleEvent` with a deferred result to allow
 * external interception and modification of the extensibility check.
 * If the event is prevented, the returned value is validated and used as the
 * final result. Type violations trigger a `ProxyError`.
 *
 * Falls back to `Reflect.isExtensible` on the sandbox or original target if
 * the event is not prevented. All outcomes resolve or reject the associated
 * deferred function to maintain consistency with other traps in the system.
 */
export default function isExtensible(resolveProxy: nx.ResolveProxy) {
  return (target: object): boolean => {
    const proxy = resolveProxy();
    const wrapper = getProxyWrapper(proxy);
    const deferred = createDeferred<nx.FunctionLike<[], boolean>>();

    const event = new ProxyEvent("isExtensible", {
      target: proxy,
      data: {
        target,
        result: deferred.promise,
      },
    }) as nx.ProxyIsExtensibleEvent;

    // Emit the proxy event to its listeners on the proxy manager
    wrapper?.manager?.events?.emit("proxy.isExtensible", event);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.events?.emit("proxy.isExtensible", event);

    if (event.defaultPrevented) {
      const { returnValue } = event;
      const isExtensible = Reflect.isExtensible(target);

      if (returnValue === undefined) {
        return resolveWith(deferred.resolve, isExtensible);
      }

      if (typeof returnValue !== "boolean") {
        return rejectWith(
          deferred.resolve,
          new ProxyError(
            `'isExtensible' trap must return a boolean value`,
            proxy,
          ),
        );
      }

      if (returnValue !== isExtensible) {
        // ECMAScript invariants prohibit returning false
        // when the actual target is extensible.
        return rejectWith(
          deferred.resolve,
          new ProxyError(
            `'isExtensible' trap result does not reflect extensibility of proxy target`,
            proxy,
          ),
        );
      }

      return resolveWith(deferred.resolve, returnValue);
    }

    return resolveWith(deferred.resolve, Reflect.isExtensible(target));
  };
}
