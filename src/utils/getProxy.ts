import Nexo from "../lib/types/Nexo.js";
import map from "../lib/maps.js";
import findProxy from "./findProxy.js";
import isTraceable from "./isTraceable.js";
import handlers from "./handlers/index.js";
import { randomUUID } from "node:crypto";
import NexoEvent from "../lib/events/NexoEvent.js";
import ProxyWrapper from "../lib/ProxyWrapper.js";

const getProxy = (
  nexo: Nexo,
  target?: Nexo.traceable | void,
  id?: string | void,
): Nexo.Proxy => {
  // find proxy by target

  const usableProxy = findProxy(target);

  if (usableProxy) {
    return usableProxy;
  }

  // create proxy

  const wrapper: Nexo.Wrapper = Object.setPrototypeOf(
    function () {},
    ProxyWrapper.prototype,
  );

  const proxy = new Proxy(wrapper, handlers) as Nexo.Proxy;
  const traceable = isTraceable(target);

  // set information about this proxy

  const proxyId = id || randomUUID();
  const targetRef = traceable ? new WeakRef(target) : target;

  const proxyData: Nexo.proxy.data = {
    id: proxyId,
    target: targetRef,
    scope: new WeakRef(nexo),
    sandbox: new Map(),
    isExtensible: true,
    wrapper: new WeakRef(wrapper),
  };

  map.proxies.set(proxy, proxyData);
  map.tracables.set(wrapper, proxy);

  if (traceable) {
    map.tracables.set(target, proxy);
  }

  const event = new NexoEvent("nx.proxy.create", {
    target: nexo,
    data: {
      id: proxyId,
      target,
    },
  });

  nexo.entries.set(proxyId, new WeakRef(proxy));
  nexo.emit(event.name, event);

  return proxy;
};

export default getProxy;
