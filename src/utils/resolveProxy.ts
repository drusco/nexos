import type * as nx from "../types/Nexo.js";
import map from "./maps.js";
import ProxyError from "../errors/ProxyError.js";
import ProxyWrapper from "./ProxyWrapper.js";
import findProxy from "./findProxy.js";

/**
 * Resolves a proxy and its corresponding wrapper for a given target
 * within the context of a specific Nexo instance.
 *
 * Throws if no proxy or wrapper is found for that instance.
 *
 * @param target - The target object or proxy to resolve.
 * @param nexoId - The nexo instance symbol owning the context.
 * @returns A tuple [proxy, wrapper].
 * @throws Error if the proxy or wrapper cannot be found.
 */
export default function resolveProxy(
  target: nx.Traceable,
  nexoId: symbol,
): [nx.Proxy, ProxyWrapper] {
  const proxy = findProxy(target, nexoId);

  if (!proxy) {
    throw new ProxyError(`No proxy found...`, target as nx.Proxy, nexoId);
  }

  const wrapper = map.proxies.get(proxy)?.get(nexoId);

  if (!wrapper) {
    throw new ProxyError(
      `No ProxyWrapper found for proxy in current instance.`,
      proxy,
      nexoId,
    );
  }

  return [proxy, wrapper];
}
