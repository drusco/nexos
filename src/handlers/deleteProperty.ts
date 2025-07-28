import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";
import { createDeferred, rejectWith, resolveWith } from "../utils/deferred.js";

export default function deleteProperty(resolveProxy: nx.resolveProxy) {
  return (target: nx.Traceable, property: nx.ObjectKey): boolean => {
    const [proxy, wrapper] = resolveProxy();
    const { sandbox } = wrapper;
    const deferred = createDeferred<nx.FunctionLike<[], boolean>>();

    const event = new ProxyEvent<nx.ProxyDeletePropertyEvent["data"]>(
      "deleteProperty",
      {
        target: proxy,
        cancelable: true,
        data: {
          target,
          property,
          result: deferred.promise,
        },
      },
    );

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

      // The target is not sealed nor frozen
      // Lets try to delete the property from the untraceable target sandbox
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
