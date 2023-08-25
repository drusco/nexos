import Exotic from "../../types/Exotic.js";
import { proxyIterator, revokeProxy } from "../../utils/index.js";

export default function kill(scope: Exotic.Emulator): void {
  for (const proxy of proxyIterator(scope)) {
    revokeProxy(proxy);
  }
}
