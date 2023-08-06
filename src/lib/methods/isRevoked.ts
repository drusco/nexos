import Exotic from "../../types/Exotic";
import { findProxy, map } from "../../utils";

export default function isRevoked(
  scope: Exotic.Emulator,
  value: Exotic.traceable,
): boolean {
  const proxy = findProxy(value);
  if (!proxy) return false;
  const { revoked } = map.proxies.get(proxy);
  return revoked;
}
