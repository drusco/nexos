import Nexo from "../../types/Nexo.js";
import { isTraceable, map } from "../../utils/index.js";
import ProxyEvent from "../ProxyEvent.js";

type descriptor = {
  enumerable?: boolean;
  writable?: boolean;
  configurable?: boolean;
  value?: unknown;
};

const defineProperty = (
  mock: Nexo.Mock,
  key: Nexo.objectKey,
  descriptor: descriptor,
): boolean => {
  const proxy = map.tracables.get(mock);
  const data = map.proxies.get(proxy);
  const { sandbox } = data;
  const scope = data.scope.deref();

  let _descriptor = descriptor;

  const event = new ProxyEvent("handler.defineProperty", {
    proxy,
    key,
    descriptor,
  });

  scope.emit(event.name, event);

  if (event.defaultPrevented) {
    _descriptor = event.returnValue;
  }

  try {
    const value = _descriptor.value;

    if (isTraceable(value)) {
      sandbox.set(key, new WeakRef(value));
    } else {
      sandbox.set(key, value);
    }
  } catch (error) {
    return false;
  }

  return true;
};

export default defineProperty;
