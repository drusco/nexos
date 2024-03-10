import NexoTS from "./types/Nexo.js";
import EventEmitter from "node:events";

export default class Nexo extends EventEmitter {
  constructor(options?: NexoTS.options) {
    console.log(options);
    super();
  }
  use(): void {}
  // link(link: Nexo.key, value?: any): Nexo.Proxy {}
  // target(value?: any): any {}
  // revoke(value: Nexo.traceable): boolean {}
  // encode(value: any): any {}
  // decode(value: any): any {}
  // exec(
  //   method: Nexo.functionLike,
  //   dependencies?: Record<string, Nexo.Proxy>,
  // ): Nexo.Proxy {}
}
