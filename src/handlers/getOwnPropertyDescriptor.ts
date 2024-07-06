import type nx from "../types/Nexo.js";
import getTarget from "../utils/getTarget.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

const getOwnPropertyDescriptor = (
  fn: nx.voidFunction,
  key: nx.objectKey,
): PropertyDescriptor => {
  const proxy = map.tracables.get(fn);
  const data = map.proxies.get(proxy);
  const wrapper = new ProxyWrapper(proxy);

  const { sandbox } = data;
  const scope = data.nexo;
  const value = getTarget(sandbox.get(key), true);

  const event = new ProxyEvent("getOwnPropertyDescriptor", {
    target: proxy,
    data: {
      key,
    },
  });

  scope.events.emit(event.name, event);
  wrapper.events.emit(event.name, event);

  return {
    configurable: true,
    enumerable: true,
    writable: true,
    value,
  };
};

export default getOwnPropertyDescriptor;
