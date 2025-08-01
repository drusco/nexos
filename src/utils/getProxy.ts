import type * as nx from "../types/Nexo.js";
import { randomUUID } from "crypto";
import maps from "./maps.js";
import NexoEvent from "../events/NexoEvent.js";
import createHandlers from "../handlers/index.js";
import ProxyWrapper from "./ProxyWrapper.js";
import Nexo from "../Nexo.js";

const getProxy = (nexo: Nexo, target?: nx.Traceable, id?: string): nx.Proxy => {
  // Return existing proxy
  if (Nexo.isProxy(target)) {
    return target;
  }

  // Return proxy used by the ID
  if (id && !target && nexo.entries.has(id)) {
    const existingProxy = nexo.entries.get(id)?.deref();
    if (existingProxy) {
      return existingProxy;
    }
  }

  // create new proxy

  // eslint-disable-next-line prefer-const
  let proxy: nx.Proxy;
  const boundFunction = function () {}.bind(null);
  const mock = Object.setPrototypeOf(boundFunction, null);
  const proxyTarget = target || mock;
  const revocable = Proxy.revocable<nx.Proxy>(
    proxyTarget,
    createHandlers(() => [proxy, Nexo.wrap(proxy)]),
  );
  const traceable = Nexo.isTraceable(target);
  proxy = revocable.proxy;

  // set information about this proxy

  const uid = id || randomUUID();
  const wrapper = new ProxyWrapper({
    id: uid,
    nexo,
    revoke: revocable.revoke,
    traceable,
  });

  maps.proxies.set(proxy, wrapper);

  if (!traceable) {
    // Remove function related properties for proxies without traceable target
    for (const key of Reflect.ownKeys(mock)) {
      const descriptor = Object.getOwnPropertyDescriptor(mock, key);
      if (descriptor.configurable) {
        delete mock[key];
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
