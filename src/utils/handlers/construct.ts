import Nexo from "../../lib/types/Nexo.js";
import getTarget from "../getTarget.js";
import getProxy from "../getProxy.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";
import map from "../../lib/maps.js";

const construct = (
  wrapper: Nexo.Wrapper,
  args: Nexo.arrayLike = [],
): object => {
  const proxy = map.tracables.get(wrapper);
  const data = map.proxies.get(proxy);
  const target = getTarget(data.target);
  const nexo = data.scope;
  const instanceProxy = getProxy(nexo);

  const event = new ProxyEvent("construct", {
    target: proxy,
    data: { arguments: args, result: instanceProxy },
    cancellable: false,
  });

  nexo.emit(event.name, event);
  wrapper.emit(event.name, event);

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
