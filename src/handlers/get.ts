import type nx from "../types/Nexo.js";
import isTraceable from "../utils/isTraceable.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";

const get = (target: nx.traceable, property: nx.objectKey): unknown => {
  const proxy = map.tracables.get(target);
  const { sandbox, nexo } = map.proxies.get(proxy);

  const event = new ProxyEvent("get", {
    target: proxy,
    cancelable: true,
    data: { target, property },
  });

  // Event listeners can modify the value to return
  if (event.defaultPrevented) {
    return event.returnValue;
  }

  if (!sandbox) {
    return Reflect.get(target, property);
  }

  const value = sandbox[property];
  const sandboxHasProperty = Object.prototype.hasOwnProperty.call(
    sandbox,
    property,
  );

  if (sandboxHasProperty) {
    if (isTraceable(value)) {
      return nexo.create(value);
    }
    return value;
  }

  return nexo.create();
};

export default get;
