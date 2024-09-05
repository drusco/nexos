import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";

const deleteProperty = (
  target: nx.traceable,
  property: nx.objectKey,
): boolean => {
  const proxy = map.tracables.get(target);
  const { sandbox } = map.proxies.get(proxy);

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

export default deleteProperty;
