import type * as nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const ownKeys = (target: nx.Traceable): nx.ObjectKey[] => {
  const proxy = map.tracables.get(target);
  const { sandbox } = map.proxies.get(proxy);

  const targetKeys = Reflect.ownKeys(target);
  const keys = sandbox ? Reflect.ownKeys(sandbox) : targetKeys;

  new ProxyEvent("ownKeys", {
    target: proxy,
    cancelable: false,
    data: { target, result: keys },
  });

  // Return the own keys from the current proxy target
  return targetKeys;
};

export default ownKeys;
