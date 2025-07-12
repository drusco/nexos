import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import Nexo from "../Nexo.js";

const getPrototypeOf = (target: nx.Traceable): object => {
  const proxy = map.tracables.get(target);
  const { sandbox } = Nexo.wrap(proxy);
  const prototype = Reflect.getPrototypeOf(target);
  const proto = sandbox ? Reflect.getPrototypeOf(sandbox) : prototype;

  new ProxyEvent("getPrototypeOf", {
    target: proxy,
    cancelable: false,
    data: { target, result: proto },
  });

  return prototype;
};

export default getPrototypeOf;
