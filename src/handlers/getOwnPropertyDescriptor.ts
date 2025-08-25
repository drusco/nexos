import type * as nx from "../types/Nexo.js";
import ProxyGetOwnPropertyDescriptorEvent from "../events/ProxyGetOwnPropertyDescriptorEvent.js";
import { createDeferred, rejectWith, resolveWith } from "../utils/deferred.js";
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
    const [proxy] = resolveProxy();
    const deferred = createDeferred<nx.FunctionLike<[], PropertyDescriptor>>();
    const descriptor = Reflect.getOwnPropertyDescriptor(target, property);

    const event = new ProxyGetOwnPropertyDescriptorEvent({
      target: proxy,
      data: {
        target,
        property,
        result: deferred.promise,
      },
    });

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

      return resolveWith(deferred.resolve, returnValue);
    }

    return resolveWith(deferred.resolve, descriptor);
  };
}
