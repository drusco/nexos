import type nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import ProxyError from "../errors/ProxyError.js";

const defineProperty = (
  fn: nx.voidFunction,
  property: nx.objectKey,
  descriptor: PropertyDescriptor = {},
): boolean => {
  const proxy = map.tracables.get(fn);
  const { sandbox } = map.proxies.get(proxy);
  const extensible = Object.isExtensible(fn);

  const event = new ProxyEvent("defineProperty", {
    target: proxy,
    cancelable: true,
    data: {
      property,
      descriptor,
    },
  });

  // Target is not extensible and may be sealed or frozen as well
  if (!extensible) {
    return Reflect.defineProperty(fn, property, descriptor);
  }

  // Property descriptor can be modified by the event listeners
  // Property definition is cancelled whenever event.preventDefault is called
  if (event.defaultPrevented) {
    return false;
  }

  if (sandbox.has(property)) {
    try {
      const mock = Object.create(null);

      Object.defineProperty(mock, property, sandbox.get(property));
      Object.defineProperty(mock, property, descriptor);
    } catch (error) {
      throw new ProxyError(error.message, proxy);
    }
  }

  sandbox.set(property, descriptor);

  return true;
};

export default defineProperty;
