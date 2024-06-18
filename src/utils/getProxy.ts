import type nx from "../lib/types/Nexo.js";
import map from "../lib/maps.js";
import findProxy from "./findProxy.js";
import isTraceable from "./isTraceable.js";
import NexoEvent from "../lib/events/NexoEvent.js";
import NexoProxy from "../lib/NexoProxy.js";
import { randomUUID } from "node:crypto";

const getProxy = (
  nexo: nx,
  target?: nx.traceable | void,
  id?: string | void,
): nx.Proxy => {
  // find proxy by target

  const usableProxy = findProxy(target);

  if (usableProxy) {
    return usableProxy;
  }

  // create proxy

  const { proxy, wrapper, revoke } = NexoProxy.create();
  const traceable = isTraceable(target);

  // set information about this proxy

  const proxyId = id || randomUUID();

  const proxyData: nx.proxy.data = {
    id: proxyId,
    target,
    scope: nexo,
    sandbox: new Map(),
    isExtensible: true,
    wrapper,
    revoke,
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
