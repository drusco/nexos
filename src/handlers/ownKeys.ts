import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";

const ownKeys = (target: nx.traceable): nx.objectKey[] => {
  const proxy = map.tracables.get(target);

  // Event is emitted for inspection purposes only
  // ProxyWrapper should have it's own 'keys' method to access the sandbox keys

  new ProxyEvent("ownKeys", {
    target: proxy,
    cancelable: false,
  });

  // Returns the own keys from the void function target
  return Reflect.ownKeys(target);
};

export default ownKeys;
