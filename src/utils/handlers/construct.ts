import Nexo from "../../lib/types/Nexo.js";
import { getProxy, getTarget, isTraceable } from "../index.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";
import map from "../../lib/maps.js";

const construct = (wrapper: Nexo.Wrapper, args: Nexo.arrayLike): object => {
  const proxy = map.tracables.get(wrapper);
  const data = map.proxies.get(proxy);
  const target = getTarget(data.target);
  const scope = data.scope.deref();

  const event = new ProxyEvent("construct", { target: proxy, data: { args } });

  scope.emit(event.name, event);
  wrapper.emit(event.name, event);

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
