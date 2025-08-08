import type * as nx from "../types/Nexo.js";
import ProxyIsExtensibleEvent from "../events/ProxyIsExtensibleEvent.js";
import { createDeferred, rejectWith, resolveWith } from "../utils/deferred.js";
import ProxyError from "../errors/ProxyError.js";

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
export default function isExtensible(resolveProxy: nx.resolveProxy) {
  return (target: nx.Traceable): boolean => {
    const [proxy, wrapper] = resolveProxy();
    const { sandbox } = wrapper;
    const deferred = createDeferred<nx.FunctionLike<[], boolean>>();
    const finalTarget = sandbox || target;

    const event = new ProxyIsExtensibleEvent({
      target: proxy,
      data: {
        target: finalTarget,
        result: deferred.promise,
      },
    });

    if (event.defaultPrevented) {
      const returnValue = event.returnValue;

      if (typeof returnValue !== "boolean") {
        return rejectWith(
          deferred.resolve,
          new ProxyError(
            `'isExtensible' trap must return a boolean value`,
            proxy,
          ),
        );
      }

      if (returnValue === false) {
        // If the proxy was created without a user-defined target (i.e. a sandboxed proxy),
        // allow simulating 'isExtensible' returning false by mutating the internal target.
        // Otherwise, we must throw, as ECMAScript invariants prohibit returning false
        // when the actual target is extensible.

        if (sandbox) {
          Object.preventExtensions(target);
        } else {
          return rejectWith(
            deferred.resolve,
            new ProxyError(
              `'isExtensible' trap result does not reflect extensibility of proxy target`,
              proxy,
            ),
          );
        }
      }
      return resolveWith(deferred.resolve, returnValue);
    }

    if (sandbox) {
      return resolveWith(deferred.resolve, Reflect.isExtensible(sandbox));
    }

    return resolveWith(deferred.resolve, Reflect.isExtensible(target));
  };
}
