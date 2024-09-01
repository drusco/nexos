import type nx from "../types/Nexo.js";
import getProxy from "../utils/getProxy.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import update from "./update.js";
import ProxyError from "../errors/ProxyError.js";
import isTraceable from "../utils/isTraceable.js";

const construct = (target: nx.traceable, args: nx.arrayLike = []): object => {
  const proxy = map.tracables.get(target);
  const { nexo, traceable } = map.proxies.get(proxy);
  const resultProxy = getProxy(nexo);

  const event = new ProxyEvent("construct", {
    target: proxy,
    data: { target, arguments: args, result: resultProxy },
    cancelable: true,
  });

  if (event.defaultPrevented) {
    if (isTraceable(event.returnValue)) {
      // return the value from the prevented event
      return update(resultProxy, event.returnValue);
    }
    throw new ProxyError(
      'Cannot return non-object on "construct" proxy trap',
      proxy,
    );
  }

  if (traceable && typeof target === "function") {
    // get the value from the original target instance

    const result: object = Reflect.construct(target, args);

    // update the proxy
    return update(resultProxy, result);
  }

  return resultProxy;
};

export default construct;
