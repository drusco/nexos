import ProxyEvent from "../events/ProxyEvent.js";
import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import isTraceable from "../utils/isTraceable.js";
import getProxy from "../utils/getProxy.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

type ProxyOrValue<T> = T extends nx.traceable ? nx.Proxy : T;

const update = <T>(proxy: nx.Proxy, value: T): ProxyOrValue<T> => {
  const data = map.proxies.get(proxy);
  const nexo = data.scope;
  const wrapper = new ProxyWrapper(proxy);

  if (isTraceable(value)) {
    value = getProxy(nexo, value) as T;
  }

  const event = new ProxyEvent("update", {
    target: proxy,
    data: value,
    cancellable: false,
  });

  nexo.emit(event.name, event);
  wrapper.events.emit(event.name, event);

  return value as ProxyOrValue<T>;
};

export default update;
