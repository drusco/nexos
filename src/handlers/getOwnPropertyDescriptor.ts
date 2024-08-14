import type nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

const getOwnPropertyDescriptor = (
  fn: nx.voidFunction,
  property: nx.objectKey,
): PropertyDescriptor => {
  const proxy = map.tracables.get(fn);
  const wrapper = new ProxyWrapper(proxy);

  // Event is emitted for inspection purposes only
  // ProxyWrapper should have it's own 'getOwnPropertyDescriptor' method to access the sandbox descriptor

  const event = new ProxyEvent("getOwnPropertyDescriptor", {
    target: proxy,
    cancellable: false,
    data: {
      property,
    },
  });

  wrapper.nexo.events.emit(event.name, event);
  wrapper.events.emit(event.name, event);

  return Reflect.getOwnPropertyDescriptor(fn, property);
};

export default getOwnPropertyDescriptor;
