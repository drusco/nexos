import type nx from "../types/Nexo.js";
import NexoEvent from "../events/NexoEvent.js";
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

  const event = new NexoEvent("nx.update", {
    target: proxy,
    data: value,
    cancellable: false,
  });

  /**
   * Emits the 'nx.update' event only to the nexo listeners
   * Emitting this event to proxy wrappers separately must be avoided
   * because adding this listener to each proxy on creation is expensive
   **/
  nexo.events.emit(event.name, event);

  return value as ProxyOrValue<T>;
};

export default update;
