import Nexo from "../types/Nexo.js";
import { map } from "../utils/index.js";

class ProxyEvent {
  name: Nexo.events.name;
  proxy: Nexo.Proxy;
  #defaultPrevented: boolean = false;
  #returnValue: unknown;

  constructor(
    name: Nexo.events.name,
    data: { proxy: Nexo.Proxy; [K: string]: unknown },
  ) {
    if (!name) {
      throw Error("ProxyEvent: event name cannot be empty");
    }

    if (!map.proxies.has(data.proxy)) {
      throw Error("ProxyEvent: invalid proxy");
    }

    this.name = name;
    Object.assign(this, data);
  }

  preventDefault(): void {
    this.#defaultPrevented = true;
  }

  next(value?: unknown): void {
    this.#returnValue = value;
  }

  get defaultPrevented(): boolean {
    return this.#defaultPrevented;
  }

  get returnValue(): unknown {
    return this.#returnValue;
  }
}

export default ProxyEvent;
