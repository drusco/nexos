import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";
import { createDeferred, rejectWith, resolveWith } from "../utils/deferred.js";

/**
 * Implements the `deleteProperty` trap for a Proxy, allowing interception of property deletions.
 *
 * Emits a cancelable `"deleteProperty"` event to provide hooks for external control or monitoring.
 * If the event is prevented, deletion is skipped and returns `false`.
 *
 * Enforces object invariants by checking whether the target or sandbox is frozen or sealed,
 * and throws a `ProxyError` if a non-configurable property is attempted to be deleted.
 *
 * Deletes the property first from the sandbox (if defined), then from the target itself.
 * If deletion fails at any point, a `ProxyError` is returned via the deferred handler.
 */

export default function deleteProperty(resolveProxy: nx.resolveProxy) {
  return (target: nx.Traceable, property: nx.ObjectKey): boolean => {
    const [proxy, wrapper] = resolveProxy();
    const { sandbox } = wrapper;
    const deferred = createDeferred<nx.FunctionLike<[], boolean>>();
    const finalTarget = sandbox || target;

    const event = new ProxyEvent<nx.ProxyDeletePropertyEvent["data"]>(
      "deleteProperty",
      {
        target: proxy,
        data: {
          target: finalTarget,
          property,
          result: deferred.promise,
        },
      },
    ) as nx.ProxyDeletePropertyEvent;

    if (event.defaultPrevented) {
      // Prevent property deletion
      return resolveWith(deferred.resolve, false);
    }

    // Delete property from the sandbox
    if (sandbox) {
      // check whether the proxy is sealed or frozen
      const frozen = Object.isFrozen(target);
      const sealed = Object.isSealed(target);

      if (sealed || frozen) {
        return rejectWith(
          deferred.resolve,
          new ProxyError(
            `Cannot delete property '${String(property)}' because it is non-configurable`,
            proxy,
          ),
        );
      }

      // The sandbox is not sealed nor frozen
      // Lets try to delete the property from it
      if (!Reflect.deleteProperty(sandbox, property)) {
        return rejectWith(
          deferred.resolve,
          new ProxyError(
            `Cannot delete property '${String(property)}' from proxy sandbox`,
            proxy,
          ),
        );
      }
    }

    // Try deleting property from traceable object target
    if (!Reflect.deleteProperty(target, property)) {
      return rejectWith(
        deferred.resolve,
        new ProxyError(
          `Cannot delete property '${String(property)}' from proxy target`,
          proxy,
        ),
      );
    }

    // Property is no longer in the target object
    return resolveWith(deferred.resolve, true);
  };
}
