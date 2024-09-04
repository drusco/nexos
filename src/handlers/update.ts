import type nx from "../types/Nexo.js";
import NexoEvent from "../events/NexoEvent.js";
import isTraceable from "../utils/isTraceable.js";
import getProxy from "../utils/getProxy.js";
import map from "../utils/maps.js";

function update(proxy: nx.Proxy, value: nx.traceable): nx.Proxy;
function update<T>(proxy: nx.Proxy, value: T): T;

function update<T>(proxy: nx.Proxy, value: T): T | nx.Proxy {
  const { nexo } = map.proxies.get(proxy);

  if (isTraceable(value)) {
    value = getProxy(nexo, value);
  }

  const event = new NexoEvent("update", {
    target: proxy,
    data: value,
    cancelable: false,
  });

  /**
   * Emits the 'update' event only to the nexo listeners
   * Emitting this event to each proxy wrapper is useless
   **/
  nexo.emit(event.name, event);

  return value;
}

export default update;
