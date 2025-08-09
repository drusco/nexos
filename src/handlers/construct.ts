import type * as nx from "../types/Nexo.js";
import ProxyConstructEvent from "../events/ProxyConstructEvent.js";
import ProxyError from "../utils/ProxyError.js";
import Nexo from "../Nexo.js";
import { createDeferred, resolveWith, rejectWith } from "../utils/deferred.js";

/**
 * Creates a `construct` trap handler for a Proxy, enabling interception and custom handling
 * of object instantiation via the `new` keyword. This trap emits a `ProxyEvent` of type `"construct"`,
 * allowing listeners to override or observe constructor behavior.
 *
 * If the event is canceled using `event.preventDefault()`, the provided `returnValue` is used—
 * but only if it is an object (traceable). Otherwise, a `ProxyError` is thrown to align with
 * JavaScript's Proxy invariants for constructor traps.
 *
 * If the proxied target is a traceable constructor function, it will be invoked using `Reflect.construct`.
 * Any errors during instantiation are caught and wrapped in a `ProxyError`.
 *
 * If no override is applied and the target isn't directly traceable, a new proxy instance is returned.
 *
 */
export default function construct(resolveProxy: nx.resolveProxy) {
  return (target: nx.FunctionLike, args: nx.ArrayLike): object => {
    const [proxy, wrapper] = resolveProxy();
    const { nexo, sandbox } = wrapper;
    const deferred = createDeferred<nx.FunctionLike<[], object>>();
    const finalTarget = sandbox || target;

    const event = new ProxyConstructEvent({
      target: proxy,
      data: {
        target: finalTarget,
        args,
        result: deferred.promise,
      },
    });

    if (event.defaultPrevented) {
      if (Nexo.isTraceable(event.returnValue)) {
        // return value from the prevented event
        const returnValue = event.returnValue;
        return resolveWith(deferred.resolve, returnValue);
      }
      return rejectWith(
        deferred.resolve,
        new ProxyError(
          'Cannot return non-object on "construct" proxy trap',
          proxy,
        ),
      );
    }

    if (!sandbox && typeof target === "function") {
      // return instance from the traceable constructor target
      try {
        const result = Reflect.construct(target, args);
        return resolveWith(deferred.resolve, result);
      } catch (error) {
        return rejectWith(
          deferred.resolve,
          new ProxyError(error.message, proxy),
        );
      }
    }

    // create a new proxy
    return resolveWith(deferred.resolve, nexo.create());
  };
}
