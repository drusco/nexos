import Exotic from "../../types/Exotic.js";
import { proxyIterator, revokeProxy, map } from "../../utils/index.js";

export default function kill(scope: Exotic.Emulator): void {
  for (const proxy of proxyIterator()) {
    const { scope: proxyScope } = map.proxies.get(proxy);
    if (scope === proxyScope) {
      revokeProxy(proxy);
    }
  }
}
