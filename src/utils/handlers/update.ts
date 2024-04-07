import ProxyEvent from "../../lib/events/ProxyEvent.js";
import Nexo from "../../lib/types/Nexo.js";
import map from "../../lib/maps.js";

const update = <Value>(proxy: Nexo.Proxy, value: Value): Value => {
  const data = map.proxies.get(proxy);
  const nexo = data.scope.deref();
  const wrapper = data.wrapper.deref();

  const event = new ProxyEvent("update", {
    target: proxy,
    data: value,
  });

  nexo.emit(event.name, event);
  wrapper.emit(event.name, event);

  return value;
};

export default update;
