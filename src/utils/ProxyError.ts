/**
 * @noInheritDoc
 *
 * Represents an error that occurs within a proxy.
 * This error class extends the built-in `Error` class and adds a `proxy` property
 * to track the proxy associated with the error. It also triggers custom events when the error is created.
 *
 * @example
 * const proxyError = new ProxyError('An error occurred with the proxy', someProxyInstance);
 */
class ProxyError extends Error implements nx.ProxyError {
  readonly name: string = "ProxyError";

  /** The proxy instance associated with this error. */
  readonly proxy: nx.Proxy;

  /**
   * Creates an instance of the `ProxyError`.
   *
   * @param message - The error message to be associated with this error.
   * @param proxy - The proxy instance that is the source of the error.
   *
   */
  constructor(message: string, proxy: nx.Proxy) {
    super(message);
    this.proxy = proxy;
  }
}

export default ProxyError;
