import Nexo from "../types/Nexo.js";
import { map } from "../utils/index.js";

class ProxyEvent<Data = unknown> {
  readonly name: string;
  readonly proxy: Nexo.Proxy;
  readonly data: Data;
  protected prevented: boolean = false;

  returnValue: unknown;

  constructor(name: string, proxy: Nexo.Proxy, data?: Data) {
    if (!name.length) {
      throw Error(`ProxyEvent: event name cannot be empty`);
    }

    if (!map.proxies.has(proxy)) {
      throw Error(`ProxyEvent ${name} proxy not found`);
    }

    this.name = name;
    this.proxy = proxy;
    this.data = data;
  }

  preventDefault(): void {
    this.prevented = true;
  }

  get defaultPrevented(): boolean {
    return this.prevented;
  }
}

export default ProxyEvent;
