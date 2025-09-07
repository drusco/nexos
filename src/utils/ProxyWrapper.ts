import type * as nx from "../types/Nexo.js";
import NexoEmitter from "./NexoEmitter.js";

/**
 * A wrapper class that manages a proxy and its associated events.
 * The `ProxyWrapper` encapsulates the functionality of proxy operations and ensures
 * that event listeners are triggered appropriately. It also provides the ability
 * to revoke the proxy and manage traceability.
 *
 * @example
 * const proxyWrapper = new ProxyWrapper({ id: 'proxy1', nexo: someNexoInstance, traceable: true, revoke: revokeFunction });
 * proxyWrapper.revoke(); // This will revoke the proxy.
 */
class ProxyWrapper implements nx.ProxyWrapper {
  /**
   * A getter that returns whether the proxy has been revoked.
   * This value is `true` if the proxy was revoked, otherwise `false`.
   *
   * @returns `true` if the proxy is revoked, `false` otherwise.
   * @example
   * const isRevoked = proxyWrapper.revoked; // Checks if the proxy is revoked.
   */
  get revoked(): boolean {
    return this.isRevoked;
  }

  get events(): nx.EventEmitter {
    return this.eventEmitter;
  }

  /** The unique identifier for the proxy wrapper. */
  readonly id: string;

  /** The `Nexo` instance associated with this proxy wrapper. */
  readonly nexo: nx.Nexo;

  readonly traceable: boolean;

  private eventEmitter?: nx.EventEmitter = new NexoEmitter();

  /** A private flag indicating whether the proxy has been revoked. */
  private isRevoked: boolean = false;

  /** The function responsible for revoking the proxy. */
  private revokeProxy?: nx.FunctionLike<[], void>;

  /**
   * Creates an instance of `ProxyWrapper`.
   * This constructor initializes the wrapper with the provided data and sets up
   * the proxy's traceability.
   *
   * @param data - The data for initializing the proxy wrapper, including `id`, `nexo`, `traceable` flag, and `revoke` function.
   * @example
   * const proxyWrapper = new ProxyWrapper({ id: 'proxy1', nexo: someNexoInstance, traceable: true, revoke: revokeFunction });
   * // Initializes the ProxyWrapper instance.
   */
  constructor(data: {
    id: string;
    nexo: nx.Nexo;
    traceable: boolean;
    revoke: nx.FunctionLike<[], void>;
  }) {
    const { id, nexo, revoke, traceable } = data;

    this.id = id;
    this.nexo = nexo;
    this.revokeProxy = revoke;
    this.traceable = traceable;
  }

  /**
   * Revokes the proxy, triggering the revoke function and marking the proxy as revoked.
   * Once revoked, the proxy can no longer be used for its original operations.
   *
   * @example
   * proxyWrapper.revoke(); // Revokes the proxy and prevents further use.
   */
  revoke(): void {
    if (!this.revokeProxy) return;
    this.revokeProxy();
    delete this.revokeProxy;
    this.isRevoked = true;
  }

  setEventEmitter(emitter: nx.EventEmitter): this {
    this.eventEmitter = emitter;
    return this;
  }

  removeEventEmitter(): void {
    this.eventEmitter = undefined;
  }
}

export default ProxyWrapper;
