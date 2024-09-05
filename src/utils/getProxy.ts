import type nx from "../types/Nexo.js";
import { randomUUID } from "node:crypto";
import map from "./maps.js";
import findProxy from "./findProxy.js";
import isTraceable from "./isTraceable.js";
import NexoEvent from "../events/NexoEvent.js";
import handlers from "../handlers/index.js";
import ProxyWrapper from "./ProxyWrapper.js";
import Nexo from "../Nexo.js";

const getProxy = (nexo: Nexo, target?: nx.traceable, id?: string): nx.Proxy => {
  // find proxy by target
  const usableProxy = findProxy(target);

  if (usableProxy) {
    return usableProxy;
  }

  // create proxy

  const proxyTarget = target || function () {};
  const revocable = Proxy.revocable(proxyTarget, handlers);
  const traceable = isTraceable(target);
  const proxy = revocable.proxy as nx.Proxy;

  // set information about this proxy

  const uid = id || randomUUID();
  const wrapper = new ProxyWrapper({
    id: uid,
    nexo,
    revoke: revocable.revoke,
    traceable,
  });

  map.proxies.set(proxy, wrapper);
  map.tracables.set(proxyTarget, proxy);

  const event = new NexoEvent("proxy", {
    target: proxy,
    data: {
      id: uid,
      target,
    },
  });

  nexo.entries.set(uid, new WeakRef(proxy));
  nexo.emit(event.name, event);

  return proxy;
};

export default getProxy;
