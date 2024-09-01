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
    data: { target, property },
  });

  if (event.defaultPrevented) {
    return false;
  }

  if (!sandbox) {
    return Reflect.deleteProperty(target, property);
  }

  try {
    return Reflect.deleteProperty(sandbox, property);
  } catch (error) {
    throw new ProxyError(error.message, proxy);
  }
};

export default deleteProperty;
