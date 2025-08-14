import type * as nx from "../types/Nexo.js";
import ProxyOwnKeysEvent from "../events/ProxyOwnKeysEvent.js";
import { createDeferred, rejectWith, resolveWith } from "../utils/deferred.js";
import ProxyError from "../utils/ProxyError.js";

/**
 * Creates a trap handler for the `ownKeys` operation on a proxy.
 *
 * This trap is responsible for intercepting calls to `Reflect.ownKeys(proxy)`,
 * such as when using `Object.keys`, `Object.getOwnPropertyNames`, or `Object.freeze`.
 *
 * The handler emits a `"proxy.ownKeys"` event, allowing listeners to override the result
 * by calling `event.preventDefault()` and returning a custom array of keys.
 *
 * - If the event is prevented and the returned value is not a valid array of strings or symbols,
 *   a `TypeError` is thrown.
 * - If the proxy uses a `sandbox`, the handler merges own keys from both `target` and `sandbox`,
 *   unless the `target` is non-extensible, in which case the `target`'s keys must match exactly.
 * - If no sandbox is used and no listener prevents the event, the default own keys of the target are returned.
 *
 * This trap ensures consistency between sandboxed keys and target keys, avoiding
 * invariant violations in non-extensible targets and preserving expected behavior
 * for consumers performing reflective operations.
 *
 */
export default function ownKeys(resolveProxy: nx.resolveProxy) {
  return (target: nx.Traceable): nx.ObjectKey[] => {
    const [proxy] = resolveProxy();
    const deferred = createDeferred<nx.FunctionLike<[], nx.ObjectKey[]>>();

    const event = new ProxyOwnKeysEvent({
      target: proxy,
      data: {
        target,
        result: deferred.promise,
      },
    });

    if (event.defaultPrevented) {
      const returnValue = event.returnValue;
      const returnIsArray = Array.isArray(returnValue);
      const hasInvalidKey = (key: unknown) =>
        typeof key !== "string" && typeof key !== "symbol";

      if (!returnIsArray || returnValue.some(hasInvalidKey)) {
        return rejectWith(
          deferred.resolve,
          new ProxyError(
            `'ownKeys' on proxy returned an invalid value, it must be an array of strings or symbols.`,
            proxy,
          ),
        );
      }

      return resolveWith(deferred.resolve, returnValue);
    }

    // return the proxy target own keys
    return resolveWith(deferred.resolve, Reflect.ownKeys(target));
  };
}
