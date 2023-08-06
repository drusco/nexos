import Exotic from "../../types/Exotic";
import { createProxy } from "../../utils";

export default function use(scope: Exotic.Emulator, value?: any): Exotic.Proxy {
  return createProxy(scope, value);
}
