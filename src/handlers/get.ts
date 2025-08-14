import type * as nx from "../types/Nexo.js";
import ProxyGetEvent from "../events/ProxyGetEvent.js";
import { createDeferred, resolveWith } from "../utils/deferred.js";

/**
 * Implements the `get` trap for a Proxy, enabling interception of property access.
 *
 * Emits a cancelable `"get"` event to allow listeners to modify or override the result.
 * If the event is prevented, the resolved `returnValue` is returned instead.
 *
 * When no sandbox is defined, property access is delegated directly to the target.
 * If a sandbox exists, it is checked first for the property before falling back to a fallback proxy creation.
 *
 * Ensures all outcomes are funneled through a deferred promise resolution for consistency.
 */
export default function get(resolveProxy: nx.resolveProxy) {
  return (target: nx.Traceable, property: nx.ObjectKey): unknown => {
    const [proxy, wrapper] = resolveProxy();
    const { nexo } = wrapper;
    const deferred = createDeferred<nx.FunctionLike<[], unknown>>();

    const event = new ProxyGetEvent({
      target: proxy,
      data: {
        target,
        property,
        result: deferred.promise,
      },
    });

    if (event.defaultPrevented) {
      return resolveWith(deferred.resolve, event.returnValue);
    }

    if (Reflect.has(target, property)) {
      // return existing value on the target or sandbox
      return resolveWith(deferred.resolve, Reflect.get(target, property));
    } else {
      // returns new proxy
      return resolveWith(deferred.resolve, nexo.create());
    }
  };
}
