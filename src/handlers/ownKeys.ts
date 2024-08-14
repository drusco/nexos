import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

const ownKeys = (fn: nx.voidFunction): nx.objectKey[] => {
  const proxy = map.tracables.get(fn);
  const wrapper = new ProxyWrapper(proxy);

  // Event is emitted for inspection purposes only
  // ProxyWrapper should have it's own 'keys' method to access the sandbox keys

  const event = new ProxyEvent("ownKeys", {
    target: proxy,
    cancellable: false,
  });

  wrapper.nexo.events.emit(event.name, event);
  wrapper.events.emit(event.name, event);

  // Returns the own keys from the void function target
  return Reflect.ownKeys(fn);
};

export default ownKeys;
