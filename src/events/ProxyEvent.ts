import Nexo from "../types/Nexo.js";
import { map } from "../utils/index.js";

class ProxyEvent<Data = unknown> {
  #name: string;
  #proxy: Nexo.Proxy;
  #defaultPrevented: boolean = false;
  #returnValue: unknown;

  data: Data;

  constructor(name: string, proxy: Nexo.Proxy, data?: Data) {
    if (!name.length) {
      throw Error(`ProxyEvent: event name cannot be empty`);
    }

    if (!map.proxies.has(proxy)) {
      throw Error(`ProxyEvent ${name} proxy not found`);
    }

    this.#name = name;
    this.#proxy = proxy;
    this.data = data;
  }

  preventDefault(): void {
    this.#defaultPrevented = true;
  }

  next(value?: unknown): void {
    this.#returnValue = value;
  }

  get name(): string {
    return this.#name;
  }

  get proxy(): Nexo.Proxy {
    return this.#proxy;
  }

  get defaultPrevented(): boolean {
    return this.#defaultPrevented;
  }

  get returnValue(): unknown {
    return this.#returnValue;
  }
}

export default ProxyEvent;
