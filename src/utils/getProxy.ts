import { randomUUID } from "node:crypto";
import type nx from "../types/Nexo.js";
import map from "./maps.js";
import findProxy from "./findProxy.js";
import isTraceable from "./isTraceable.js";
import NexoEvent from "../events/NexoEvent.js";
import handlers from "../handlers/index.js";
import ProxyWrapper from "./ProxyWrapper.js";

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

  const fn = function () {};
  const revocable = Proxy.revocable(fn, handlers);
  const traceable = isTraceable(target);
  const proxy = revocable.proxy as nx.Proxy;

  // set information about this proxy

  const uid = id || randomUUID();

  const data: nx.proxy.data = {
    id: uid,
    fn,
    target,
    nexo,
    sandbox: new Map(),
    revoke: revocable.revoke,
    revoked: false,
    wrapper: new ProxyWrapper(proxy),
  };

  map.proxies.set(proxy, data);
  map.tracables.set(fn, proxy);

  if (traceable) {
    map.tracables.set(target, proxy);
  }

  const event = new NexoEvent("nx.proxy", {
    target: nexo,
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
