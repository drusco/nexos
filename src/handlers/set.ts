import type nx from "../types/Nexo.js";
import getTarget from "../utils/getTarget.js";
import isTraceable from "../utils/isTraceable.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";

const set = (
  fn: nx.voidFunction,
  key: nx.objectKey,
  value: unknown,
): boolean => {
  const proxy = map.tracables.get(fn);
  const data = map.proxies.get(proxy);
  const { sandbox } = data;

  let _value = getTarget(value, true);

  const event = new ProxyEvent("set", { target: proxy, data: { key, value } });

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
