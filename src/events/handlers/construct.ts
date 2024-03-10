import Nexo from "../../types/Nexo.js";
import { getProxy, getTarget, isTraceable, map } from "../../utils/index.js";
import ProxyEvent from "../ProxyEvent.js";

const construct = (mock: Nexo.Mock, args: unknown[]): object => {
  const proxy = map.tracables.get(mock);
  const data = map.proxies.get(proxy);
  const target = getTarget(data.target);
  const scope = data.scope.deref();

  const event = new ProxyEvent("handler.construct", {
    proxy,
    args,
  });

  scope.emit(event.name, event);

  if (event.defaultPrevented) {
    const returnValue = event.returnValue;
    if (!isTraceable(returnValue)) {
      return null;
    }
    return returnValue;
  }

  if (typeof target === "function") {
    // get the value from the original target

    const instance: object = Reflect.construct(
      target,
      args.map((arg) => getTarget(arg)),
    );

    return getProxy(scope, instance);
  }

  return getProxy(scope);
};

export default construct;
