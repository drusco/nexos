import type nx from "../types/Nexo.js";
import isTraceable from "../utils/isTraceable.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";

const set = (
  target: nx.traceable,
  key: nx.objectKey,
  value: unknown,
): boolean => {
  const proxy = map.tracables.get(target);
  const { sandbox } = map.proxies.get(proxy);

  let _value = value;

  const event = new ProxyEvent("set", {
    target: proxy,
    data: { target, key, value },
  });

  if (event.defaultPrevented) {
    _value = event.returnValue;
  }

  if (isTraceable(_value)) {
    // sandbox.set(key, new WeakRef(_value));
  } else {
    sandbox.set(key, _value);
  }

  return true;
};

export default set;
