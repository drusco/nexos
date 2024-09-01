import type nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";

const getOwnPropertyDescriptor = (
  target: nx.traceable,
  property: nx.objectKey,
): PropertyDescriptor => {
  const proxy = map.tracables.get(target);

  // Event is emitted for inspection purposes only
  // ProxyWrapper should have it's own 'getOwnPropertyDescriptor' method to access the sandbox descriptor

  new ProxyEvent("getOwnPropertyDescriptor", {
    target: proxy,
    cancelable: false,
    data: {
      target,
      property,
    },
  });

  return Reflect.getOwnPropertyDescriptor(target, property);
};

export default getOwnPropertyDescriptor;
