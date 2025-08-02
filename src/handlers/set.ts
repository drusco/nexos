import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";
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
    const [proxy, wrapper] = resolveProxy();
    const { sandbox } = wrapper;
    const deferred = createDeferred<nx.FunctionLike<[], boolean>>();

    const finalTarget = sandbox || target;
    let finalValue = value;

    const event = new ProxyEvent<nx.ProxySetEvent["data"]>("set", {
      target: proxy,
      data: {
        target: finalTarget,
        property,
        value,
        result: deferred.promise,
      },
    }) as nx.ProxySetEvent;

    if (event.defaultPrevented) {
      finalValue = event.returnValue;
    }

    try {
      if (!Reflect.set(finalTarget, property, finalValue)) {
        throw new TypeError(
          `Cannot set property '${String(property)}' on the target`,
        );
      }
      return resolveWith(deferred.resolve, true);
    } catch (error) {
      return rejectWith(deferred.resolve, new ProxyError(error.message, proxy));
    }
  };
}
