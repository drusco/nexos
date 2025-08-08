import type * as nx from "../types/Nexo.js";
import ProxyApplyEvent from "../events/ProxyApplyEvent.js";
import ProxyError from "../errors/ProxyError.js";
import { createDeferred, resolveWith, rejectWith } from "../utils/deferred.js";

/**
 * Creates an `apply` trap handler for a Proxy, enabling interception and custom handling
 * of function calls on proxied objects. This trap emits a `ProxyEvent` of type `"apply"`,
 * allowing listeners to override or observe function invocation behavior.
 *
 * If the event is prevented (`event.preventDefault()` is called), the `returnValue` from the event
 * is used instead of invoking the target function.
 *
 * If the target is a traceable function, the original function is invoked via `Reflect.apply`
 * and its result is resolved. Any errors during invocation are caught and wrapped in a `ProxyError`.
 *
 * If no applicable behavior is found, a fallback proxy instance is created and returned.
 *
 */

export default function apply(resolveProxy: nx.resolveProxy) {
  return (
    target: nx.FunctionLike,
    thisArg: unknown = undefined,
    args: nx.ArrayLike,
  ): unknown => {
    const [proxy, wrapper] = resolveProxy();
    const { nexo, sandbox } = wrapper;
    const deferred = createDeferred<nx.FunctionLike>();
    const finalTarget = sandbox || target;

    const event = new ProxyApplyEvent({
      target: proxy,
      data: {
        target: finalTarget,
        thisArg,
        args,
        result: deferred.promise,
      },
    });

    if (event.defaultPrevented) {
      // return value from the prevented event
      const returnValue = event.returnValue;
      return resolveWith(deferred.resolve, returnValue);
    }

    if (!sandbox && typeof target === "function") {
      // return result from the traceable function target
      try {
        const result = Reflect.apply(target, thisArg, args);
        return resolveWith(deferred.resolve, result);
      } catch (error) {
        const proxyError = new ProxyError(error.message, proxy);
        return rejectWith(deferred.resolve, proxyError);
      }
    }

    // defaults to a new proxy
    return resolveWith(deferred.resolve, nexo.create());
  };
}
