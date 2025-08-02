import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import { createDeferred, rejectWith, resolveWith } from "../utils/deferred.js";
import ProxyError from "../errors/ProxyError.js";

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
    const [proxy, wrapper] = resolveProxy();
    const { sandbox } = wrapper;
    const deferred = createDeferred<nx.FunctionLike<[], boolean>>();

    const event = new ProxyEvent<nx.ProxyPreventExtensionsEvent["data"]>(
      "preventExtensions",
      {
        target: proxy,
        data: {
          target: sandbox || target,
          result: deferred.promise,
        },
      },
    ) as nx.ProxyPreventExtensionsEvent;

    if (event.defaultPrevented) {
      try {
        const returnValue = event.returnValue || false;
        if (returnValue !== false) {
          throw new TypeError(
            `'preventExtensions' trap must return false or undefined when cancelled`,
          );
        }

        return resolveWith(deferred.resolve, returnValue);
      } catch (error) {
        return rejectWith(
          deferred.resolve,
          new ProxyError(error.message, proxy),
        );
      }
    }

    if (sandbox) {
      Reflect.preventExtensions(sandbox);
    }

    return resolveWith(deferred.resolve, Reflect.preventExtensions(target));
  };
}
