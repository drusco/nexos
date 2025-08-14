import type * as nx from "../types/Nexo.js";
import ProxySetPrototypeOfEvent from "../events/ProxySetPrototypeOfEvent.js";
import ProxyError from "../utils/ProxyError.js";
import { createDeferred, rejectWith, resolveWith } from "../utils/deferred.js";

/**
 * setPrototypeOf handler for proxies.
 *
 * Intercepts attempts to change the prototype of a proxy-wrapped object and
 * dispatches a cancellable "proxy.setPrototypeOf" event. Listeners can override
 * the prototype being set or prevent the operation entirely.
 *
 * The handler ensures the following:
 * - If the target is non-extensible, the prototype must remain unchanged.
 * - If the prototype set (or returned by a listener) is not an object or null,
 *   the operation is rejected with a ProxyError.
 * - The prototype is applied to both the real target and sandbox.
 *
 * Events:
 * - The dispatched event contains a promise `result`, which resolves with the
 *   outcome of the operation.
 * - Listeners may call `preventDefault()` and return a custom prototype.
 *
 * This supports complex metaprogramming behaviors and runtime policy enforcement.
 */
export default function setPrototypeOf(resolveProxy: nx.resolveProxy) {
  return (target: nx.Traceable, prototype: object): boolean => {
    const [proxy] = resolveProxy();
    const deferred = createDeferred<nx.FunctionLike<[], boolean>>();
    let finalPrototype: unknown = prototype;

    const event = new ProxySetPrototypeOfEvent({
      target: proxy,
      data: {
        target,
        prototype,
        result: deferred.promise,
      },
    });

    if (event.defaultPrevented) {
      finalPrototype = event.returnValue;
    }

    // Throw an error when the prototype is not an object or null
    if (typeof finalPrototype !== "object") {
      return rejectWith(
        deferred.resolve,
        new ProxyError(
          "Cannot set the new prototype because it is not an object or null",
          proxy,
        ),
      );
    }

    return resolveWith(
      deferred.resolve,
      Reflect.setPrototypeOf(target, finalPrototype),
    );
  };
}
