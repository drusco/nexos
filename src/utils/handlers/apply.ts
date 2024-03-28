import Nexo from "../../lib/types/Nexo.js";
import getTarget from "../getTarget.js";
import getProxy from "../getProxy.js";
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
  const nexo = data.scope.deref();

  const event = new ProxyEvent("apply", {
    target: proxy,
    data: { this: that, arguments: args },
    cancellable: true,
  });

  nexo.emit(event.name, event);
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

  return getProxy(nexo);
};

export default apply;
