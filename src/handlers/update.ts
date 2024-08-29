import type nx from "../types/Nexo.js";
import NexoEvent from "../events/NexoEvent.js";
import isTraceable from "../utils/isTraceable.js";
import getProxy from "../utils/getProxy.js";
import map from "../utils/maps.js";

type Proxy<Type> = nx.typeExtends<Type, nx.traceable, nx.Proxy>;

const update = <Type>(proxy: nx.Proxy, value: Type): Proxy<Type> => {
  const { nexo } = map.proxies.get(proxy);

  if (isTraceable(value)) {
    value = getProxy(nexo, value) as Type;
  }

  const event = new NexoEvent("update", {
    target: proxy,
    data: value,
    cancelable: false,
  });

  /**
   * Emits the 'update' event only to the nexo listeners
   * Emitting this event to proxy wrappers separately must be avoided
   * because adding this listener to each proxy on creation is expensive
   **/
  nexo.emit(event.name, event);

  return value as Proxy<Type>;
};

export default update;
