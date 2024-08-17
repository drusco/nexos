import type nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";
import NexoError from "../errors/NexoError.js";

const defineProperty = (
  fn: nx.voidFunction,
  property: nx.objectKey,
  descriptor: PropertyDescriptor = {},
): boolean => {
  const proxy = map.tracables.get(fn);
  const wrapper = new ProxyWrapper(proxy);
  const { sandbox, nexo } = map.proxies.get(proxy);
  const extensible = Object.isExtensible(fn);

  const event = new ProxyEvent("defineProperty", {
    target: proxy,
    cancellable: true,
    data: {
      property,
      descriptor,
    },
  });

  nexo.events.emit(event.name, event);
  wrapper.events.emit(event.name, event);

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
      new NexoError(error.message, proxy, nexo.events, wrapper.events);
      return false;
    }
  }

  sandbox.set(property, descriptor);

  return true;
};

export default defineProperty;
