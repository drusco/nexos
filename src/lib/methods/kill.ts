import Exotic from "../../types/Exotic";
import { proxyIterator, revokeProxy, map } from "../../utils";

export default function kill(scope: Exotic.Emulator): void {
  for (const proxy of proxyIterator()) {
    const { scope: proxyScope } = map.proxies.get(proxy);
    if (scope === proxyScope) {
      revokeProxy(proxy);
    }
  }
}
