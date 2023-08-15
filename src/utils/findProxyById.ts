import Exotic from "../types/Exotic";
import map from "./map";
import proxyIterator from "./proxyIterator";

export default function findProxyById(
  scope: Exotic.Emulator,
  id: number,
): void | Exotic.Proxy {
  for (const proxy of proxyIterator()) {
    const { scope: proxyScope, id: proxyId } = map.proxies.get(proxy);
    if (scope === proxyScope && id === proxyId) {
      return proxy;
    }
  }
}
