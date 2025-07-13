import type * as nx from "../types/Nexo.js";
import { randomUUID } from "crypto";
import map from "./maps.js";
import findProxy from "./findProxy.js";
import isTraceable from "./isTraceable.js";
import NexoEvent from "../events/NexoEvent.js";
import createHandlers from "../handlers/index.js";
import ProxyWrapper from "./ProxyWrapper.js";
import Nexo from "../Nexo.js";

const getProxy = (nexo: Nexo, target?: nx.Traceable, id?: string): nx.Proxy => {
  const instanceId = nexo.id;

  // find proxy by target
  const usableProxy = findProxy(target, instanceId);

  if (usableProxy) {
    return usableProxy;
  }

  // create proxy

  const fn = Object.setPrototypeOf(new Function(), null);
  const proxyTarget = target || fn;
  const revocable = Proxy.revocable<nx.Proxy>(
    proxyTarget,
    createHandlers(nexo.id),
  );
  const traceable = isTraceable(target);
  const proxy = revocable.proxy;

  // set information about this proxy

  const uid = id || randomUUID();
  const wrapper = new ProxyWrapper({
    id: uid,
    nexo,
    revoke: revocable.revoke,
    traceable,
  });

  if (!map.proxies.has(proxy)) {
    map.proxies.set(proxy, new Map());
  }

  map.proxies.get(proxy).set(instanceId, wrapper);

  if (!map.tracables.has(proxyTarget)) {
    map.tracables.set(proxyTarget, new Map());
  }

  map.tracables.get(proxyTarget).set(instanceId, proxy);

  if (!traceable) {
    // Remove function related properties for proxies without traceable target
    for (const key of Reflect.ownKeys(fn)) {
      const descriptor = Object.getOwnPropertyDescriptor(fn, key);
      if (descriptor.configurable) {
        delete fn[key];
      }
    }
  }

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
