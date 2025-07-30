import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import { createDeferred, rejectWith, resolveWith } from "../utils/deferred.js";
import ProxyError from "../errors/ProxyError.js";

/**
 * Creates a `getOwnPropertyDescriptor` trap handler for a Proxy,
 * emitting a `ProxyEvent` that allows consumers to intercept or override
 * the behavior of property descriptor retrieval.
 *
 * This function checks for an active `sandbox` context; if present,
 * it will retrieve the descriptor from it instead of the target.
 *
 * @param resolveProxy - A function that returns the proxy and its associated wrapper,
 *                       including sandbox context if any.
 * @returns A Proxy trap function for `getOwnPropertyDescriptor` that emits
 *          a `ProxyEvent`, supports interception, and handles default fallbacks.
 */
export default function getOwnPropertyDescriptor(
  resolveProxy: nx.resolveProxy,
) {
  return (target: nx.Traceable, property: nx.ObjectKey): PropertyDescriptor => {
    const [proxy, wrapper] = resolveProxy();
    const { sandbox } = wrapper;
    const deferred = createDeferred<nx.FunctionLike<[], PropertyDescriptor>>();
    const prototype = Reflect.getOwnPropertyDescriptor(target, property);

    const event = new ProxyEvent<nx.ProxyGetOwnPropertyDescriptorEvent["data"]>(
      "getOwnPropertyDescriptor",
      {
        target: proxy,
        cancelable: true,
        data: {
          target: sandbox || target,
          property,
          result: deferred.promise,
        },
      },
    ) as nx.ProxyGetOwnPropertyDescriptorEvent;

    if (event.defaultPrevented) {
      const returnValue = event.returnValue;
      if (
        returnValue !== undefined &&
        (returnValue === null || typeof returnValue !== "object")
      ) {
        throw new ProxyError(
          `'getOwnPropertyDescriptor' must return an object or undefined for property '${String(property)}'.`,
          proxy,
        );
      }
      try {
        return resolveWith(deferred.resolve, returnValue);
      } catch (error) {
        return rejectWith(
          deferred.resolve,
          new ProxyError(error.message, proxy),
        );
      }
    }

    if (sandbox) {
      // Attempt to get the descriptor from the sandbox.
      let proto = Object.getOwnPropertyDescriptor(sandbox, property);

      // If the property is non-configurable in the original target,
      // the proxy trap MUST return a descriptor that exactly matches the target.
      // Returning a descriptor from the sandbox would violate this invariant.
      if (prototype && !prototype.configurable) {
        proto = prototype;
      }

      // Resolve with either the sandbox descriptor (if safe) or the original target’s.
      return resolveWith(deferred.resolve, proto);
    }

    return resolveWith(deferred.resolve, prototype);
  };
}
