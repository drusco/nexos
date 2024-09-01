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

  try {
    // Traceable target objects
    // ----

    if (!sandbox) {
      const current = Reflect.getOwnPropertyDescriptor(target, property);
      const success = Reflect.defineProperty(target, property, descriptor);

      if (!success) {
        if (current) {
          // Should throw an in detail error
          const mock = Object.create(null);

          Object.defineProperty(mock, property, current);
          Object.defineProperty(mock, property, descriptor);
        }

        // Fallback error
        throw TypeError(
          `'defineProperty' on proxy: trap returned falsish for property '${String(property)}'"`,
        );
      }
      return true;
    }

    // Non-traceable target objects
    // ----

    // Target is not extensible and may be sealed or frozen as well
    if (!extensible) {
      if (!Reflect.defineProperty(target, property, descriptor)) {
        throw TypeError(
          `Cannot define property '${String(property)}', object is not extensible"`,
        );
      }
      return true;
    }

    Object.defineProperty(sandbox, property, descriptor);

    return true;
  } catch (error) {
    throw new ProxyError(error.message, proxy);
  }
};

export default defineProperty;
