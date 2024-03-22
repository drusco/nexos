import Nexo from "../../lib/types/Nexo.js";
import { getTarget, isTraceable } from "../index.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";
import map from "../../lib/maps.js";

const set = (mock: Nexo.Mock, key: Nexo.objectKey, value: unknown): boolean => {
  const proxy = map.tracables.get(mock);
  const data = map.proxies.get(proxy);
  const { sandbox } = data;
  const scope = data.scope.deref();

  let _value = getTarget(value, true);

  const event = new ProxyEvent("set", proxy, { key, value });

  scope.emit(event.name, event);
  mock.emit(event.name, event);

  if (event.defaultPrevented) {
    _value = event.returnValue;
  }

  if (isTraceable(_value)) {
    sandbox.set(key, new WeakRef(_value));
  } else {
    sandbox.set(key, _value);
  }

  return true;
};

export default set;
