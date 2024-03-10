import Nexo from "../../types/Nexo.js";
import { getTarget, getProxy, map } from "../../utils/index.js";
import ProxyEvent from "../ProxyEvent.js";

const apply = (mock: Nexo.Mock, that?: unknown, args?: unknown[]): unknown => {
  const proxy = map.tracables.get(mock);
  const data = map.proxies.get(proxy);
  const target = getTarget(data.target);
  const scope = data.scope.deref();

  const event = new ProxyEvent("handler.apply", {
    proxy,
    that,
    args,
  });

  scope.emit(event.name, event);

  if (event.defaultPrevented) {
    return;
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
