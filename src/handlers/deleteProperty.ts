import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";
import resolveProxy from "../utils/resolveProxy.js";

export default function deleteProperty(nexoId: symbol) {
  return (target: nx.Traceable, property: nx.ObjectKey): boolean => {
    const [proxy, wrapper] = resolveProxy(target, nexoId);
    const { sandbox } = wrapper;

    const event = new ProxyEvent("deleteProperty", {
      target: proxy,
      cancelable: true,
      data: { target, property },
    });

    if (event.defaultPrevented) {
      // Prevent property deletion
      return false;
    }

    // Delete property from the sandbox
    if (sandbox) {
      // check whether the proxy is sealed or frozen
      const frozen = Object.isFrozen(target);
      const sealed = Object.isSealed(target);

      if (sealed || frozen) {
        throw new ProxyError(
          `Cannot delete property '${String(property)}' because it is non-configurable`,
          proxy,
        );
      }

      // The target is not sealed nor frozen
      // Lets try to delete the property from the untraceable target sandbox
      if (!Reflect.deleteProperty(sandbox, property)) {
        throw new ProxyError(
          `Cannot delete property '${String(property)}' from proxy sandbox`,
          proxy,
        );
      }
    }

    // Try deleting property from traceable object target
    if (!Reflect.deleteProperty(target, property)) {
      throw new ProxyError(
        `Cannot delete property '${String(property)}' from proxy target`,
        proxy,
      );
    }

    // Property is no longer in the target object
    return true;
  };
}
