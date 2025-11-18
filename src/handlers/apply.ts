import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../utils/ProxyError.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";
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

export default function apply(wrapper: nx.ProxyWrapper) {
  return (
    target: nx.FunctionLike,
    thisArg: unknown = undefined,
    args: unknown[] = [],
  ): unknown => {
    const { proxy, manager, traceable } = wrapper;
    const deferred = createDeferred<nx.FunctionLike>();

    const event = new ProxyEvent("apply", {
      target: proxy,
      data: {
        target,
        thisArg,
        args,
        result: deferred.promise,
      },
    }) as nx.ProxyApplyEvent;

    // Emit the proxy event to its listeners on the proxy manager
    wrapper?.manager?.events?.emit("proxy.apply", event);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.events?.emit("proxy.apply", event);

    if (event.defaultPrevented) {
      // return value from the prevented event
      const returnValue = event.returnValue;
      return resolveWith(deferred.resolve, returnValue);
    }

    if (traceable && typeof target === "function") {
      // return result from the traceable function target
      try {
        const result = Reflect.apply(target, thisArg, args);
        return resolveWith(deferred.resolve, result);
      } catch (error) {
        const proxyError = new ProxyError(error.message, proxy);
        return rejectWith(deferred.resolve, proxyError);
      }
    }

    // create a new managed proxy
    if (manager) {
      return resolveWith(deferred.resolve, manager.create());
    }

    // create a new unmanaged proxy
    return resolveWith(deferred.resolve, new ProxyWrapper().proxy);
  };
}
