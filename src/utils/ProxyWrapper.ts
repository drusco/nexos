import isTraceable from "./isTraceable.js";
import NexoEmitter from "./NexoEmitter.js";
import { v4 as uuid } from "uuid";

/**
 * A wrapper class that manages a proxy and its associated events.
 * The `ProxyWrapper` encapsulates the functionality of proxy operations and ensures
 * that event listeners are triggered appropriately. It also provides the ability
 * to revoke the proxy and manage traceability.
 *
 */
class ProxyWrapper implements nx.ProxyWrapper {
  get revoked(): boolean {
    return this.isRevoked;
  }

  get events(): nx.EventEmitter<nx.ProxyEvents> | undefined {
    return this.eventEmitter;
  }

  get id(): string {
    return this.proxyId;
  }

  get target(): nx.Traceable {
    return this.proxyTarget;
  }

  get nexo(): nx.Nexo | undefined {
    return this.managerInstance;
  }

  get traceable(): boolean {
    return this.isTraceable;
  }

  /** The underlying target object */
  private proxyTarget: nx.Traceable;

  /** Whether the `proxy` was created with a custom target object */
  private isTraceable: boolean = false;

  /** The proxy manager associated with the proxy */
  private managerInstance?: nx.Nexo;

  /** Event emitter instance */
  private eventEmitter?: nx.EventEmitter = new NexoEmitter();

  /** Indicates whether the proxy has been revoked */
  private isRevoked: boolean = false;

  /** The function responsible for revoking the proxy */
  private revokeProxy?: () => void;

  /** A unique identifier for the proxy */
  private proxyId: string = uuid();

  /**
   * Creates an instance of `ProxyWrapper`.
   * This constructor initializes the wrapper with the provided data and sets up
   * the proxy's traceability.
   *
   * @param data - The data for initializing the proxy wrapper, `revoke` function.
   * @example
   * const proxyWrapper = new ProxyWrapper({});
   * // Initializes the ProxyWrapper instance.
   */
  constructor(revoke?: () => void) {
    if (typeof revoke === "function") {
      this.revokeProxy = revoke;
    }
  }

  revoke(): void {
    if (this.isRevoked) return;
    if (typeof this.revokeProxy === "function") {
      this.revokeProxy();
      this.revokeProxy = undefined;
    }
    this.isRevoked = true;
  }

  setEventEmitter(emitter: nx.EventEmitter): this {
    if (this.isRevoked) return this;
    this.eventEmitter = emitter;
    return this;
  }

  removeEventEmitter(): this {
    this.eventEmitter = undefined;
    return this;
  }

  setManager(manager: nx.Nexo): this {
    if (this.isRevoked) return this;
    this.managerInstance = manager;
    return this;
  }

  removeManager(): this {
    this.managerInstance = undefined;
    return this;
  }

  setTarget(target: nx.Traceable, traceable: boolean = true): this {
    if (this.isRevoked) return this;
    if (isTraceable(target)) {
      this.proxyTarget = target;
      this.isTraceable = traceable === true;
    }
    return this;
  }

  setId(id: string): this {
    if (this.isRevoked) return this;
    if (typeof id === "string" && id.length) {
      this.proxyId = id;
    }
    return this;
  }
}

export default ProxyWrapper;
