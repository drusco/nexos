import type * as nx from "../types/Nexo.js";
import { randomUUID } from "crypto";
import map from "./maps.js";
import findProxy from "./findProxy.js";
import isTraceable from "./isTraceable.js";
import NexoEvent from "../events/NexoEvent.js";
import handlers from "../handlers/index.js";
import ProxyWrapper from "./ProxyWrapper.js";
import Nexo from "../Nexo.js";

const getProxy = (nexo: Nexo, target?: nx.Traceable, id?: string): nx.Proxy => {
  // find proxy by target
  const usableProxy = findProxy(target);

  if (usableProxy) {
    return usableProxy;
  }

  // create proxy

  const fn = Object.setPrototypeOf(new Function(), null);
  const proxyTarget = target || fn;
  const revocable = Proxy.revocable<nx.Proxy>(proxyTarget, handlers);
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

  map.proxies.set(proxy, wrapper);
  map.tracables.set(proxyTarget, proxy);

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
