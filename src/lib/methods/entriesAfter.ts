import Exotic from "../../types/Exotic";
import { findProxy, proxyGenerator } from "../../utils";

export default function* entriesAfter(
  scope: Exotic.Emulator,
  value: Exotic.traceable,
): Iterable<Exotic.Proxy> {
  const currentProxy = findProxy(value);
  for (const proxy of proxyGenerator(scope, value, false)) {
    if (proxy !== currentProxy) {
      yield proxy;
    }
  }
}
