import { randomUUID } from "node:crypto";
import type nx from "../types/Nexo.js";
import map from "./maps.js";
import findProxy from "./findProxy.js";
import isTraceable from "./isTraceable.js";
import NexoEvent from "../events/NexoEvent.js";
import handlers from "../handlers/index.js";
import EventEmitter from "node:events";

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

  const fn = new Function() as nx.functionLike;
  const revocable = Proxy.revocable(fn, handlers);
  const traceable = isTraceable(target);
  const proxy = revocable.proxy as nx.Proxy;

  // set information about this proxy

  const uid = id || randomUUID();

  const data: nx.proxy.data = {
    id: uid,
    fn,
    target,
    scope: nexo,
    sandbox: new Map(),
    isExtensible: true,
    events: new EventEmitter(),
    revoke: revocable.revoke,
  };

  map.proxies.set(proxy, data);
  map.tracables.set(fn, proxy);

  if (traceable) {
    map.tracables.set(target, proxy);
  }

  const event = new NexoEvent("nx.proxy.create", {
    target: nexo,
    data: {
      id: uid,
      target,
    },
  });

  nexo.entries.set(uid, new WeakRef(proxy));
  nexo.events.emit(event.name, event);

  return proxy;
};

export default getProxy;
