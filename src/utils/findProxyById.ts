import Nexo from "../types/Nexo.js";
import map from "./map.js";
import proxyIterator from "./proxyIterator.js";
import isProxyPayload from "./isProxyPayload.js";

export default function findProxyById(
  scope: Nexo.Emulator,
  id: string,
): void | Nexo.Proxy {
  // Find proxy by unique proxy ID
  const uid = isProxyPayload(id) ? id.substring(1) : id;

  for (const proxy of proxyIterator(scope)) {
    const proxyData = map.proxies.get(proxy);
    if (uid === proxyData.id) {
      return proxy;
    }
  }
}
