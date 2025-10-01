import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../utils/ProxyError.js";
import { createDeferred, rejectWith, resolveWith } from "../utils/deferred.js";
import getProxyWrapper from "../utils/getProxyWrapper.js";

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
    const proxy = resolveProxy();
    const wrapper = getProxyWrapper(proxy);
    const deferred = createDeferred<nx.FunctionLike<[], boolean>>();
    let finalPrototype: unknown = prototype;

    const event = new ProxyEvent("setPrototypeOf", {
      target: proxy,
      data: {
        target,
        prototype,
        result: deferred.promise,
      },
    }) as nx.ProxySetPrototypeOfEvent;

    // Emit the proxy event to its listeners on the 'nexo' emitter
    wrapper?.nexo?.events?.emit("proxy.setPrototypeOf", event);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.events?.emit("proxy.setPrototypeOf", event);

    if (event.defaultPrevented) {
      finalPrototype = event.returnValue;
    }

    if (finalPrototype === undefined) {
      return resolveWith(deferred.resolve, false);
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
