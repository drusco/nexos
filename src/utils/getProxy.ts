import type * as nx from "../types/Nexo.js";
import { randomUUID } from "crypto";
import maps from "./maps.js";
import createHandlers from "../handlers/index.js";
import ProxyWrapper from "./ProxyWrapper.js";
import ProxyCreateEvent from "../events/ProxyCreateEvent.js";
import Nexo from "../Nexo.js";
import { createDeferred, resolveWith } from "./deferred.js";

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

  const uid = id || randomUUID();
  const traceable = Nexo.isTraceable(target);
  const boundFunction = function () {}.bind(null);
  const sandbox = Object.setPrototypeOf(boundFunction, null);
  const proxyTarget = target || sandbox;
  const deferred = createDeferred<nx.FunctionLike<[], nx.Proxy>>();

  const revocable = Proxy.revocable<nx.Proxy>(
    proxyTarget,
    createHandlers(() => [proxy, Nexo.wrap(proxy)]),
  );

  proxy = revocable.proxy;

  // set information about the proxy

  const wrapper = new ProxyWrapper({
    id: uid,
    nexo,
    revoke: revocable.revoke,
    traceable,
  });

  if (!traceable) {
    // Remove function related properties for proxies without traceable target
    for (const key of Reflect.ownKeys(sandbox)) {
      const descriptor = Object.getOwnPropertyDescriptor(sandbox, key);
      if (descriptor.configurable) {
        delete sandbox[key];
      }
    }
  }

  maps.proxies.set(proxy, wrapper);
  nexo.entries.set(uid, new WeakRef(proxy));

  const event = new ProxyCreateEvent({
    target: proxy,
    data: {
      id: uid,
      target: proxyTarget,
      result: deferred.promise,
    },
  });

  // check whether the event got prevented
  if (event.defaultPrevented) {
    const { returnValue } = event;
    if (returnValue) {
      // return a different proxy object
      return resolveWith(deferred.resolve, returnValue);
    }
  }

  return resolveWith(deferred.resolve, proxy);
};

export default getProxy;
