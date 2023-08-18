import Exotic from "../../types/Exotic";
import { createProxy } from "../../utils";

export default function use(scope: Exotic.Emulator, value?: any): Exotic.Proxy {
  // create a proxy by target reference
  return createProxy(scope, undefined, value);
}
