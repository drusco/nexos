import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../utils/ProxyError.js";
import { createDeferred, rejectWith, resolveWith } from "../utils/deferred.js";
import getProxyWrapper from "../utils/getProxyWrapper.js";

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
  return (target: object, property: nx.ObjectKey): boolean => {
    const proxy = resolveProxy();
    const wrapper = getProxyWrapper(proxy);
    const deferred = createDeferred<nx.FunctionLike<[], boolean>>();

    const event = new ProxyEvent("deleteProperty", {
      target: proxy,
      data: {
        target,
        property,
        result: deferred.promise,
      },
    }) as nx.ProxyDeletePropertyEvent;

    // Emit the proxy event to its listeners on the proxy manager
    wrapper?.manager?.events?.emit("proxy.deleteProperty", event);
    // Emit the proxy event to its listeners on the wrapper's event emitter
    wrapper?.events?.emit("proxy.deleteProperty", event);

    if (event.defaultPrevented) {
      // Prevent property deletion
      return resolveWith(deferred.resolve, false);
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
