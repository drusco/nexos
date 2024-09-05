import type nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";

const getOwnPropertyDescriptor = (
  target: nx.traceable,
  property: nx.objectKey,
): PropertyDescriptor => {
  const proxy = map.tracables.get(target);
  const { sandbox } = map.proxies.get(proxy);

  const targetDescriptor = Reflect.getOwnPropertyDescriptor(target, property);
  const descriptor = sandbox
    ? Object.getOwnPropertyDescriptor(sandbox, property)
    : targetDescriptor;

  new ProxyEvent("getOwnPropertyDescriptor", {
    target: proxy,
    data: {
      target,
      property,
      descriptor,
    },
  });

  return targetDescriptor;
};

export default getOwnPropertyDescriptor;
