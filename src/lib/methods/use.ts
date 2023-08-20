import Exotic from "../../types/Exotic.js";
import { createProxy } from "../../utils/index.js";

export default function use(scope: Exotic.Emulator, value?: any): Exotic.Proxy {
  // create a proxy by target reference
  return createProxy(scope, undefined, value);
}
