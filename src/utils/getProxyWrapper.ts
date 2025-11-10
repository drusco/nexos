import getProxyMap from "./getProxyMap.js";
import ProxyError from "./ProxyError.js";

/**
 * Provides a wrapper for an existing proxy.
 *
 * @remarks
 * This method wraps a proxy object and allows interaction with the proxy's events and properties.
 * Proxy-related events follow the format `proxy.handler`, where the handler corresponds to one of the standard proxy handler functions such as `apply`, `construct`, `get`, etc.
 *
 * @param proxy - An existing {@link nx.Proxy | Proxy} object
 * @returns A {@link nx.ProxyWrapper | ProxyWrapper} for the proxy that allows interaction with proxy events
 * @throws {@link nx.ProxyError} if the wrapper cannot be found.
 */
export default function getProxyWrapper(
  proxy: object,
): nx.ProxyWrapper<nx.ProxyEvents> {
  const wrapper = getProxyMap().get(proxy);

  if (!wrapper) {
    throw new ProxyError(`No wrapper found for the proxy.`, proxy);
  }

  return wrapper;
}
