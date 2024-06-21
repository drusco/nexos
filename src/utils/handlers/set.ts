import type Nexo from "../../lib/types/Nexo.js";
import getTarget from "../getTarget.js";
import isTraceable from "../isTraceable.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";
import map from "../../lib/maps.js";

const set = (
  wrapper: Nexo.Wrapper,
  key: Nexo.objectKey,
  value: unknown,
): boolean => {
  const proxy = map.tracables.get(wrapper);
  const data = map.proxies.get(proxy);
  const { sandbox } = data;
  const scope = data.scope;

  let _value = getTarget(value, true);

  const event = new ProxyEvent("set", { target: proxy, data: { key, value } });

  scope.emit(event.name, event);
  wrapper.emit(event.name, event);

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
