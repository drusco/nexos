import type nx from "../types/Nexo.js";
import getTarget from "../utils/getTarget.js";
import getProxy from "../utils/getProxy.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import update from "./update.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

const apply = (
  fn: nx.voidFunction,
  that: unknown = undefined,
  args: nx.arrayLike = [],
): unknown => {
  const proxy = map.tracables.get(fn);
  const data = map.proxies.get(proxy);
  const target = getTarget(data.target);
  const nexo = data.scope;
  const resultProxy = getProxy(nexo);
  const wrapper = new ProxyWrapper(proxy);

  const event = new ProxyEvent("apply", {
    target: proxy,
    data: { this: that, arguments: args, result: resultProxy },
    cancellable: true,
  });

  nexo.events.emit(event.name, event);
  wrapper.events.emit(event.name, event);

  if (event.defaultPrevented) {
    return update(resultProxy, event.returnValue);
  }

  if (typeof target === "function") {
    // get the value from the original target

    const functionResult = target.apply(
      getTarget(that),
      args.map((arg) => getTarget(arg)),
    );

    return update(resultProxy, functionResult);
  }

  return resultProxy;
};

export default apply;
