import type * as nx from "../types/Nexo.js";
import ProxyGetPrototypeOfEvent from "../events/ProxyGetPrototypeOfEvent.js";
import { createDeferred, rejectWith, resolveWith } from "../utils/deferred.js";
import ProxyError from "../utils/ProxyError.js";

/**
 * Proxy trap implementation for `getPrototypeOf`.
 *
 * This trap intercepts calls to `Object.getPrototypeOf(proxy)` or operations
 * like `Reflect.getPrototypeOf(proxy)` and optionally emits a cancelable event
 * before returning the prototype. If the event is prevented, the handler validates
 * the returned value and uses it instead. Otherwise, it defaults to the prototype
 * of the sandbox or the original target object.
 */
export default function getPrototypeOf(resolveProxy: nx.resolveProxy) {
  return (target: nx.Traceable): object => {
    const [proxy] = resolveProxy();
    const deferred = createDeferred<nx.FunctionLike<[], object>>();

    const event = new ProxyGetPrototypeOfEvent({
      target: proxy,
      data: {
        target,
        result: deferred.promise,
      },
    });

    if (event.defaultPrevented) {
      if (typeof event.returnValue !== "object") {
        return rejectWith(
          deferred.resolve,
          new ProxyError(
            `'getPrototypeOf' on proxy: trap returned neither object nor null`,
            proxy,
          ),
        );
      }
      return resolveWith(deferred.resolve, event.returnValue);
    }

    return resolveWith(deferred.resolve, Reflect.getPrototypeOf(target));
  };
}
