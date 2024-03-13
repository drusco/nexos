import Nexo from "../types/Nexo.js";
import { map } from "../utils/index.js";

class ProxyEvent {
  name: string;
  proxy: Nexo.Proxy;
  data: Record<string, unknown> = {};
  #defaultPrevented: boolean = false;
  #returnValue: unknown;

  constructor(name: string, proxy: Nexo.Proxy, data?: Record<string, unknown>) {
    if (!name.length) {
      throw Error(`ProxyEvent: event name cannot be empty`);
    }

    if (!map.proxies.has(proxy)) {
      throw Error(`ProxyEvent ${name} proxy not found`);
    }

    this.name = name;
    this.proxy = proxy;

    if (data) {
      Object.assign(this.data, data);
    }
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
