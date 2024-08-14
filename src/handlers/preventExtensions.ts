import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

const preventExtensions = (fn: nx.functionLike): boolean => {
  const proxy = map.tracables.get(fn);
  const data = map.proxies.get(proxy);
  const scope = data.nexo;
  const wrapper = new ProxyWrapper(proxy);

  const event = new ProxyEvent("preventExtensions", { target: proxy });

  scope.events.emit(event.name, event);
  wrapper.events.emit(event.name, event);

  return Reflect.preventExtensions(fn);
};

export default preventExtensions;
