import Exotic from "../../types/Exotic";
import { findProxy, map } from "../../utils";

export default function getId(
  scope: Exotic.Emulator,
  value: Exotic.traceable,
): number {
  const proxy = findProxy(value);
  if (!proxy) {
    return NaN;
  }
  const { id } = map.proxies.get(proxy);
  return id;
}
