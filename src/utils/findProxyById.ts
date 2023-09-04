import Exotic from "../types/Exotic.js";
import map from "./map.js";
import proxyIterator from "./proxyIterator.js";
import isPayload from "./isPayload.js";

export default function findProxyById(
  scope: Exotic.Emulator,
  id: string,
): Exotic.Proxy | void {
  const uid = isPayload(id) ? id.substring(1) : id;
  for (const proxy of proxyIterator(scope)) {
    const proxyData = map.proxies.get(proxy);
    if (uid === proxyData.id) {
      return proxy;
    }
  }
}
