import type nx from "../types/Nexo.js";
import NexoEmitter from "../events/NexoEmitter.js";
import Nexo from "../Nexo.js";

class ProxyWrapper extends NexoEmitter {
  readonly id: string;
  readonly nexo: Nexo;
  readonly traceable: boolean;
  readonly sandbox: void | nx.traceable;
  private _revoked: boolean = false;
  private _revoke: nx.voidFunction;

  constructor(data: {
    id: string;
    nexo: Nexo;
    traceable: boolean;
    revoke: nx.voidFunction;
  }) {
    super();

    this.id = data.id;
    this.nexo = data.nexo;
    this.traceable = data.traceable;
    this._revoke = data.revoke;

    if (!data.traceable) {
      // Untraceable targets get a sandbox to interact as traceable objects
      this.sandbox = Object.create(null);
    }
  }

  revoke(): void {
    if (!this._revoke) return;
    this._revoke();
    delete this._revoke;
    this._revoked = true;
  }

  get revoked(): boolean {
    return this._revoked;
  }
}

export default ProxyWrapper;
