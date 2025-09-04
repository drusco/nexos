import type * as nx from "../types/Nexo.js";
import { v4 as uuid } from "uuid";
import maps from "./maps.js";
import createHandlers from "../handlers/index.js";
import ProxyWrapper from "./ProxyWrapper.js";
import ProxyCreateEvent from "../events/ProxyCreateEvent.js";
import { createDeferred, resolveWith } from "./deferred.js";
import isProxy from "./isProxy.js";
import isTraceable from "./isTraceable.js";

const createProxy = (
  nexo: nx.Nexo,
  target?: nx.Traceable,
  id?: string,
  anonymous: boolean = false,
): nx.Proxy => {
  // Return existing proxy
  if (isProxy(target)) {
    return target;
  }

  // Return proxy used by the ID
  if (!target && nexo.entries.has(id)) {
    const proxy = nexo.entries.get(id)?.deref();
    if (proxy) return proxy;
  }

  // create new proxy
  // eslint-disable-next-line prefer-const
  let proxyRef: WeakRef<nx.Proxy>;

  const uid = id || uuid();
  const traceable = isTraceable(target);
  const boundFunction = new Function().bind(null);
  const sandbox = Object.setPrototypeOf(boundFunction, null);
  const proxyTarget = target || sandbox;
  const deferred = createDeferred<nx.FunctionLike<[], nx.Proxy>>();

  const { proxy, revoke } = Proxy.revocable<nx.Proxy>(
    proxyTarget,
    createHandlers(() => proxyRef.deref()),
  );

  proxyRef = new WeakRef(proxy);

  if (!traceable) {
    // Remove function related properties for proxies without traceable target
    for (const key of Reflect.ownKeys(sandbox)) {
      const descriptor = Object.getOwnPropertyDescriptor(sandbox, key);
      if (descriptor.configurable) {
        delete sandbox[key];
      }
    }
  }

  // create a proxy wrapper to interact with the proxy
  const wrapper = new ProxyWrapper({
    id: uid,
    nexo,
    revoke,
    traceable,
  });

  // link the proxy to it's wrapper
  maps.proxies.set(proxy, wrapper);

  if (anonymous) {
    // Private proxies behave like regular proxies, but they:
    //   1. Do not trigger 'proxy' events.
    //   2. Are not exposed to the nexo instance.
    // This ensures they remain opaque and cannot be traced back.

    return resolveWith(deferred.resolve, proxy);
  }

  // add a reference to the proxy in the nexo instance

  nexo.entries.set(uid, proxyRef);

  // create and emit a 'proxy' event to the event listeners

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

    if (isProxy(returnValue) && returnValue !== proxy) {
      // revoke the original proxy in the event
      revoke();
      // remove the original proxy from the maps
      maps.proxies.delete(proxy);
      nexo.entries.delete(uid);
      // reset the entry if the returned proxy has the same id
      if (uid === maps.proxies.get(returnValue)?.id) {
        nexo.entries.set(uid, new WeakRef(returnValue));
      }
      // return a different proxy object
      return resolveWith(deferred.resolve, returnValue);
    }
  }

  return resolveWith(deferred.resolve, proxy);
};

export default createProxy;
