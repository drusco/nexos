import type nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";

const getOwnPropertyDescriptor = (
  fn: nx.voidFunction,
  property: nx.objectKey,
): PropertyDescriptor => {
  const proxy = map.tracables.get(fn);

  // Event is emitted for inspection purposes only
  // ProxyWrapper should have it's own 'getOwnPropertyDescriptor' method to access the sandbox descriptor

  new ProxyEvent("getOwnPropertyDescriptor", {
    target: proxy,
    cancelable: false,
    data: {
      property,
    },
  });

  return Reflect.getOwnPropertyDescriptor(fn, property);
};

export default getOwnPropertyDescriptor;
