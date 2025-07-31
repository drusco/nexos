import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import { createDeferred, rejectWith, resolveWith } from "../utils/deferred.js";
import ProxyError from "../errors/ProxyError.js";

/**
 * Proxy trap handler for the `has` operation (used by the `in` operator).
 *
 * This function creates and emits a custom `ProxyHasEvent`, allowing listeners to
 * intercept and optionally override the result of the `in` check on a proxy object.
 *
 * If the event is canceled (`event.preventDefault()`), the provided return value is
 * validated to ensure it's a boolean. If not, a `ProxyError` is thrown.
 *
 * If the event is not canceled, the check is forwarded to either the sandbox (if present)
 * or the original target using `Reflect.has`.
 *
 * Deferred resolution is used to allow async inspection of the result via the event's
 * `.data.result` promise.
 *
 */
export default function has(resolveProxy: nx.resolveProxy) {
  return (target: nx.Traceable, property: nx.ObjectKey): boolean => {
    const [proxy, wrapper] = resolveProxy();
    const { sandbox } = wrapper;
    const deferred = createDeferred<nx.FunctionLike<[], boolean>>();

    const event = new ProxyEvent<nx.ProxyHasEvent["data"]>("has", {
      target: proxy,
      cancelable: true,
      data: {
        target: sandbox || target,
        property,
        result: deferred.promise,
      },
    }) as nx.ProxyHasEvent;

    if (event.defaultPrevented) {
      try {
        const returnValue = event.returnValue;
        if (typeof returnValue !== "boolean") {
          throw new TypeError(`'has' trap must return a boolean value`);
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
      return resolveWith(deferred.resolve, Reflect.has(sandbox, property));
    }

    return resolveWith(deferred.resolve, Reflect.has(target, property));
  };
}
