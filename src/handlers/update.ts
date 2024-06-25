import ProxyEvent from "../events/ProxyEvent.js";
import type nx from "../types/Nexo.js";
import isTraceable from "../utils/isTraceable.js";
import getProxy from "../utils/getProxy.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

type ProxyOrValue<T> = T extends nx.traceable ? nx.Proxy : T;

const update = <T>(proxy: nx.Proxy, value: T): ProxyOrValue<T> => {
  const wrapper = new ProxyWrapper(proxy);
  const { nexo } = wrapper;

  if (isTraceable(value)) {
    value = getProxy(nexo, value) as T;
  }

  const event = new ProxyEvent("update", {
    target: proxy,
    data: value,
    cancellable: false,
  });

  nexo.events.emit(event.name, event);
  wrapper.events.emit(event.name, event);

  return value as ProxyOrValue<T>;
};

export default update;
