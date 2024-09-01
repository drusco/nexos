import type nx from "../types/Nexo.js";
import NexoEmitter from "../events/NexoEmitter.js";
import map from "./maps.js";
import Nexo from "../Nexo.js";

class ProxyWrapper extends NexoEmitter {
  private proxy: nx.proxy.data;

  constructor(proxy: nx.Proxy) {
    super();
    this.proxy = map.proxies.get(proxy);
  }

  get id(): string {
    return this.proxy.id;
  }

  get nexo(): Nexo {
    return this.proxy.nexo;
  }

  revoke(): void {
    this.proxy.revoke();
    this.proxy.revoked = true;
  }

  get revoked(): boolean {
    return this.proxy.revoked;
  }
}

export default ProxyWrapper;
