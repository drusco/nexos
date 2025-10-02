import ProxyEvent from "../events/ProxyEvent.js";
import { createDeferred, rejectWith, resolveWith } from "../utils/deferred.js";
import getProxyWrapper from "../utils/getProxyWrapper.js";
import ProxyError from "../utils/ProxyError.js";

/**
 * Creates a `getOwnPropertyDescriptor` trap handler for a Proxy,
 * emitting a `ProxyEvent` that allows consumers to intercept or override
 * the behavior of property descriptor retrieval.
 */
export default function getOwnPropertyDescriptor(
  resolveProxy: nx.resolveProxy,
) {
  return (target: nx.Traceable, property: nx.ObjectKey): PropertyDescriptor => {
    const proxy = resolveProxy();
    const wrapper = getProxyWrapper(proxy);
    const deferred = createDeferred<nx.FunctionLike<[], PropertyDescriptor>>();
    const descriptor = Reflect.getOwnPropertyDescriptor(target, property);

    const event = new ProxyEvent("getOwnPropertyDescriptor", {
      target: proxy,
      data: {
        target,
        property,
        result: deferred.promise,
      },
    }) as nx.ProxyGetOwnPropertyDescriptorEvent;

    // Emit the proxy event to its listeners on the proxy manager
    wrapper?.manager?.events?.emit("proxy.getOwnPropertyDescriptor", event);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.events?.emit("proxy.getOwnPropertyDescriptor", event);

    if (event.defaultPrevented) {
      const returnValue = event.returnValue;

      if (
        returnValue !== undefined &&
        (returnValue === null || typeof returnValue !== "object")
      ) {
        return rejectWith(
          deferred.resolve,
          new ProxyError(
            `'getOwnPropertyDescriptor' must return an object or undefined for property '${String(property)}'.`,
            proxy,
          ),
        );
      }

      return resolveWith(deferred.resolve, returnValue || undefined);
    }

    return resolveWith(deferred.resolve, descriptor);
  };
}
