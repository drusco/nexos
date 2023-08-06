import Exotic from "../../types/Exotic";
import { findProxy, map } from "../../utils";

export default function children(
  scope: Exotic.Emulator,
  value?: Exotic.traceable,
): Exotic.Proxy[] {
  const results = [];
  const proxy = findProxy(value);
  if (!proxy) return results;
  const { sandbox } = map.proxies.get(proxy);
  return Reflect.ownKeys(sandbox).map((key) => sandbox[key]);
}
