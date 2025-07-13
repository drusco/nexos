import type * as nx from "../types/Nexo.js";
import map from "../utils/maps.js";

/**
 * Represents an error that occurs within a proxy.
 * This error class extends the built-in `Error` class and adds a `proxy` property
 * to track the proxy associated with the error. It also triggers custom events when the error is created.
 *
 * @example
 * const proxyError = new ProxyError('An error occurred with the proxy', someProxyInstance);
 */
class ProxyError extends Error {
  /** The proxy instance associated with this error. */
  readonly proxy: nx.Proxy;

  /**
   * Creates an instance of the `ProxyError`.
   *
   * This constructor not only initializes the error message but also emits custom events
   * on the associated proxy's `nexo` event emitter and a separate `wrapper` event emitter.
   *
   * @param message - The error message to be associated with this error.
   * @param proxy - The proxy instance that is the source of the error.
   *
   * @example
   * const proxyError = new ProxyError('An error occurred with the proxy', someProxyInstance);
   * // This will emit 'proxy.error' events on both the proxy's nexo emitter and wrapper.
   */
  constructor(message: string, proxy: nx.Proxy) {
    super(message);
    this.proxy = proxy;

    // Retrieve the wrappers for the proxy and emit the error events
    const wrappers = map.proxies.get(proxy);

    if (wrappers) {
      for (const wrapper of wrappers.values()) {
        // Emit the error event on the 'nexo' event emitter
        wrapper.nexo?.emit("proxy.error", this);
        // Emit the error event on the wrapper's event emitter
        wrapper.emit("proxy.error", this);
      }
    }
  }
}

export default ProxyError;
