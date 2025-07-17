import type * as nx from "../types/Nexo.js";
import NexoEmitter from "../events/NexoEmitter.js";
import Nexo from "../Nexo.js";

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
class ProxyWrapper extends NexoEmitter implements nx.ProxyWrapper {
  /** The unique identifier for the proxy wrapper. */
  readonly id: string;

  /** The `Nexo` instance associated with this proxy wrapper. */
  readonly nexo: Nexo;

  /** A flag indicating if the proxy is traceable. */
  readonly traceable: boolean;

  /** The sandbox for the proxy if it is not traceable, otherwise `undefined`. */
  readonly sandbox: void | nx.Traceable;

  /** A private flag indicating whether the proxy has been revoked. */
  private _revoked: boolean = false;

  /** The function responsible for revoking the proxy. */
  private _revoke: nx.FunctionLike<[], void>;

  /**
   * Creates an instance of `ProxyWrapper`.
   * This constructor initializes the wrapper with the provided data and sets up
   * the proxy's traceability. If the proxy is not traceable, a sandbox is created.
   *
   * @param data - The data for initializing the proxy wrapper, including `id`, `nexo`, `traceable` flag, and `revoke` function.
   * @example
   * const proxyWrapper = new ProxyWrapper({ id: 'proxy1', nexo: someNexoInstance, traceable: true, revoke: revokeFunction });
   * // Initializes the ProxyWrapper instance.
   */
  constructor(data: {
    id: string;
    nexo: Nexo;
    traceable: boolean;
    revoke: nx.FunctionLike<[], void>;
  }) {
    super();

    this.id = data.id;
    this.nexo = data.nexo;
    this.traceable = data.traceable;
    this._revoke = data.revoke;

    // If the proxy is not traceable, create a sandbox
    if (!data.traceable) {
      this.sandbox = Object.create(null);
    }
  }

  /**
   * Revokes the proxy, triggering the revoke function and marking the proxy as revoked.
   * Once revoked, the proxy can no longer be used for its original operations.
   *
   * @example
   * proxyWrapper.revoke(); // Revokes the proxy and prevents further use.
   */
  revoke(): void {
    if (this._revoke) {
      this._revoke();
      delete this._revoke;
      this._revoked = true;
    }
  }

  /**
   * A getter that returns whether the proxy has been revoked.
   * This value is `true` if the proxy was revoked, otherwise `false`.
   *
   * @returns `true` if the proxy is revoked, `false` otherwise.
   * @example
   * const isRevoked = proxyWrapper.revoked; // Checks if the proxy is revoked.
   */
  get revoked(): boolean {
    return this._revoked;
  }
}

export default ProxyWrapper;
