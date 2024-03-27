import Nexo from "../../lib/types/Nexo.js";
import { getTarget, getProxy } from "../index.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";
import map from "../../lib/maps.js";

const apply = (
  wrapper: Nexo.Wrapper,
  that: unknown,
  args: Nexo.arrayLike,
): unknown => {
  const proxy = map.tracables.get(wrapper);
  const data = map.proxies.get(proxy);
  const target = getTarget(data.target);
  const scope = data.scope.deref();

  const event = new ProxyEvent("apply", proxy, { that, args });

  scope.emit(event.name, event);
  wrapper.emit(event.name, event);

  if (event.defaultPrevented) {
    return event.returnValue;
  }

  if (typeof target === "function") {
    // get the value from the original target

    const value: unknown = Reflect.apply(
      target,
      getTarget(that),
      args.map((arg) => getTarget(arg)),
    );

    return value;
  }

  return getProxy(scope);
};

export default apply;
