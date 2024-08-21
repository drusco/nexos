import type nx from "../types/Nexo.js";
import NexoEvent from "../events/NexoEvent.js";
import isTraceable from "../utils/isTraceable.js";
import getProxy from "../utils/getProxy.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

type Proxy<Type> = nx.typeExtends<Type, nx.traceable, nx.Proxy>;

const update = <Type>(proxy: nx.Proxy, value: Type): Proxy<Type> => {
  const wrapper = new ProxyWrapper(proxy);
  const { nexo } = wrapper;

  if (isTraceable(value)) {
    value = getProxy(nexo, value) as Type;
  }

  const event = new NexoEvent("nx.update", {
    target: proxy,
    data: value,
    cancelable: false,
  });

  /**
   * Emits the 'nx.update' event only to the nexo listeners
   * Emitting this event to proxy wrappers separately must be avoided
   * because adding this listener to each proxy on creation is expensive
   **/
  nexo.events.emit(event.name, event);

  return value as Proxy<Type>;
};

export default update;
