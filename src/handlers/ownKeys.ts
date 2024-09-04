import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const ownKeys = (target: nx.traceable): nx.objectKey[] => {
  const proxy = map.tracables.get(target);
  const { sandbox } = map.proxies.get(proxy);

  // Event is emitted for inspection purposes only
  // ProxyWrapper should have its own 'keys' method to access the sandbox keys

  const targetKeys = Reflect.ownKeys(target);
  const keys = sandbox ? Reflect.ownKeys(sandbox) : targetKeys;

  new ProxyEvent("ownKeys", { target: proxy, data: keys });

  // Return the own keys from the current proxy target
  return targetKeys;
};

export default ownKeys;
