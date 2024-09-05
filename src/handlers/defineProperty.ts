import type nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import ProxyError from "../errors/ProxyError.js";

const defineProperty = (
  target: nx.traceable,
  property: nx.objectKey,
  descriptor: PropertyDescriptor = {},
): boolean => {
  const proxy = map.tracables.get(target);
  const { sandbox } = map.proxies.get(proxy);
  const extensible = Object.isExtensible(target);
  const targetDescriptor = Reflect.getOwnPropertyDescriptor(target, property);

  const event = new ProxyEvent("defineProperty", {
    target: proxy,
    cancelable: extensible,
    data: {
      target,
      property,
      descriptor,
    },
  });

  // Property descriptor can be modified by the event listeners
  // Property definition is cancelled whenever event.preventDefault is called
  if (event.defaultPrevented) {
    return false;
  }

  // Traceable target objects
  // ----

  if (!sandbox) {
    if (!Reflect.defineProperty(target, property, descriptor)) {
      throw new ProxyError(
        `Cannot define property '${String(property)}' on proxy target"`,
        proxy,
      );
    }
    return true;
  }

  // Untraceable target objects
  // ----

  // Target is not extensible and may be sealed or frozen as well
  if (!extensible) {
    if (!Reflect.defineProperty(target, property, descriptor)) {
      throw new ProxyError(
        `Cannot define property '${String(property)}', object is not extensible"`,
        proxy,
      );
    }
    return true;
  }

  // If the property exists and is configurable, don't allow making it non-configurable
  if (
    targetDescriptor &&
    targetDescriptor.configurable &&
    descriptor.configurable === false
  ) {
    throw new ProxyError(
      `Cannot define non-configurable property '${String(property)}' that is configurable on the target`,
      proxy,
    );
  }

  // If the property does not exist on the target, but you're trying to define it as non-configurable
  if (!targetDescriptor && descriptor.configurable === false) {
    throw new ProxyError(
      `Cannot define non-configurable property '${String(property)}' because it does not exist on the target`,
      proxy,
    );
  }

  // Define the property on the sandbox
  if (!Reflect.defineProperty(sandbox, property, descriptor)) {
    throw new ProxyError(
      `Cannot define property '${String(property)}' on proxy sandbox"`,
      proxy,
    );
  }

  // Act as if the property was defined on the target
  return true;
};

export default defineProperty;
