import type nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import isTraceable from "../utils/isTraceable.js";

const set = (
  target: nx.traceable,
  property: nx.objectKey,
  value: unknown,
): boolean => {
  const proxy = map.tracables.get(target);
  const { sandbox, nexo } = map.proxies.get(proxy);

  let _value = value;

  const event = new ProxyEvent("set", {
    target: proxy,
    data: { target, property, value },
  });

  if (event.defaultPrevented) {
    _value = event.returnValue;
  }

  if (!sandbox) {
    return Reflect.set(target, property, _value);
  }

  if (isTraceable(_value)) {
    _value = nexo.create(_value);
  }

  return Reflect.set(sandbox, property, _value);
};

export default set;
