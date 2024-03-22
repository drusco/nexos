import Nexo from "../lib/types/Nexo.js";
import map from "../lib/maps.js";
import findProxy from "./findProxy.js";
import isTraceable from "./isTraceable.js";
import handlers from "./handlers/index.js";
import EventEmitter from "node:events";
import { randomUUID } from "node:crypto";
import ProxyNexo from "../lib/ProxyNexo.js";
import NexoEvent from "../lib/events/NexoEvent.js";

const getProxy = (
  scope: ProxyNexo,
  target: Nexo.traceable | void,
): Nexo.Proxy => {
  // find proxy by target

  const usableProxy = findProxy(target);

  if (usableProxy) {
    return usableProxy;
  }

  // create proxy

  const mock: Nexo.Mock = Object.setPrototypeOf(
    function () {},
    EventEmitter.prototype,
  );

  const proxy = new Proxy(mock, handlers) as Nexo.Proxy;
  const traceable = isTraceable(target);

  // set information about this proxy

  const proxyId = randomUUID();

  const proxyData: Nexo.proxy.data = {
    id: proxyId,
    target: traceable ? new WeakRef(target) : target,
    scope: new WeakRef(scope),
    sandbox: new Map(),
    isExtensible: true,
    mock: new WeakRef(mock),
  };

  map.proxies.set(proxy, proxyData);
  map.tracables.set(mock, proxy);

  if (traceable) {
    map.tracables.set(target, proxy);
  }

  const event = new NexoEvent("proxy.create", target, proxyId);

  scope.entries.set(proxyId, new WeakRef(proxy));
  scope.emit(event.name, event);

  return proxy;
};

export default getProxy;
