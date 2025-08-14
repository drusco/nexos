import type * as nx from "../types/Nexo.js";
import ProxySetEvent from "../events/ProxySetEvent.js";
import ProxyError from "../utils/ProxyError.js";
import { createDeferred, rejectWith, resolveWith } from "../utils/deferred.js";

/**
 * Trap for handling `set` operations on the proxy.
 *
 * Emits a `proxy.set` event allowing listeners to:
 * - Intercept property assignments on the proxy
 * - Optionally override the value by returning a replacement
 * - Prevent default behavior to provide a custom return value
 *
 * If not prevented, the assignment proceeds on either the sandbox or
 * the original target, following standard JavaScript semantics.
 *
 * Errors are wrapped in a `ProxyError` to provide consistent error handling
 * throughout the proxy system.
 *
 * The final resolved result reflects the behavior of `Reflect.set`.
 */
export default function set(resolveProxy: nx.resolveProxy) {
  return (
    target: nx.Traceable,
    property: nx.ObjectKey,
    value: unknown,
  ): boolean => {
    const [proxy] = resolveProxy();
    const deferred = createDeferred<nx.FunctionLike<[], boolean>>();
    let finalValue = value;

    const event = new ProxySetEvent({
      target: proxy,
      data: {
        target,
        property,
        value,
        result: deferred.promise,
      },
    });

    if (event.defaultPrevented) {
      finalValue = event.returnValue;
    }

    if (!Reflect.set(target, property, finalValue)) {
      return rejectWith(
        deferred.resolve,
        new ProxyError(
          `Cannot set property '${String(property)}' on the target`,
          proxy,
        ),
      );
    }

    return resolveWith(deferred.resolve, true);
  };
}
