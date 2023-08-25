import Exotic from "../types/Exotic.js";
import map from "./map.js";
import proxyIterator from "./proxyIterator.js";

export default function findProxyById(
  scope: Exotic.Emulator,
  id: number,
): void | Exotic.Proxy {
  for (const proxy of proxyIterator(scope)) {
    const { id: proxyId } = map.proxies.get(proxy);
    if (id === proxyId) {
      return proxy;
    }
  }
}
