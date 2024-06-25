import type nx from "../types/Nexo.js";
import getTarget from "../utils/getTarget.js";
import getProxy from "../utils/getProxy.js";
import ProxyEvent from "../events/ProxyEvent.js";
import map from "../utils/maps.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

const construct = (fn: nx.voidFunction, args: nx.arrayLike = []): object => {
  const proxy = map.tracables.get(fn);
  const data = map.proxies.get(proxy);
  const target = getTarget(data.target);
  const nexo = data.scope;
  const instanceProxy = getProxy(nexo);
  const wrapper = new ProxyWrapper(proxy);

  const event = new ProxyEvent("construct", {
    target: proxy,
    data: { arguments: args, result: instanceProxy },
  });

  nexo.events.emit(event.name, event);
  wrapper.events.emit(event.name, event);

  if (typeof target === "function") {
    // get the value from the original target

    const instanceResult: object = Reflect.construct(
      target,
      args.map((arg) => getTarget(arg)),
    );

    // update the proxy target
    const instanceData = map.proxies.get(instanceProxy);
    instanceData.target = instanceResult;
  }

  return instanceProxy;
};

export default construct;
