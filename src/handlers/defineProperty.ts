import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import ProxyError from "../errors/ProxyError.js";

const defineProperty = (
  target: nx.Traceable,
  property: nx.ObjectKey,
  descriptor: PropertyDescriptor,
): boolean => {
  const proxy = map.tracables.get(target);
  const { sandbox } = map.proxies.get(proxy);
  const extensible = Object.isExtensible(target);

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
  // When the target is not extensible, frozen or sealed then the sandbox should be too
  if (!extensible) {
    if (!Reflect.defineProperty(target, property, descriptor)) {
      throw new ProxyError(
        `Cannot define property '${String(property)}', object is not extensible"`,
        proxy,
      );
    }
    return true;
  }

  const sandboxDescriptor = Reflect.getOwnPropertyDescriptor(sandbox, property);

  // If the property exists and is configurable, don't allow making it non-configurable
  if (
    sandboxDescriptor &&
    sandboxDescriptor.configurable &&
    descriptor.configurable === false
  ) {
    throw new ProxyError(
      `Cannot define non-configurable property '${String(property)}' that is configurable on the sandbox`,
      proxy,
    );
  }

  // If the property does not exist on the target, but you're trying to define it as non-configurable
  if (!sandboxDescriptor && descriptor.configurable === false) {
    throw new ProxyError(
      `Cannot define non-configurable property '${String(property)}' because it does not exist on the sandbox`,
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
