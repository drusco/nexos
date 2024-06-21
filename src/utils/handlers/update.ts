import ProxyEvent from "../../lib/events/ProxyEvent.js";
import type Nexo from "../../lib/types/Nexo.js";
import map from "../../lib/maps.js";
import isTraceable from "../isTraceable.js";
import getProxy from "../getProxy.js";

type ProxyOrValue<T> = T extends Nexo.traceable ? Nexo.Proxy : T;

const update = <T>(proxy: Nexo.Proxy, value: T): ProxyOrValue<T> => {
  const data = map.proxies.get(proxy);
  const nexo = data.scope;
  const wrapper = data.wrapper;

  if (isTraceable(value)) {
    value = getProxy(nexo, value) as T;
  }

  const event = new ProxyEvent("update", {
    target: proxy,
    data: value,
    cancellable: false,
  });

  nexo.emit(event.name, event);
  wrapper.emit(event.name, event);

  return value as ProxyOrValue<T>;
};

export default update;
