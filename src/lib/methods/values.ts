import Exotic from "../../types/Exotic.js";
import { findProxy, map } from "../../utils/index.js";

export default function values(value?: Exotic.traceable): Exotic.Proxy[] {
  const results = [];
  const proxy = findProxy(value);
  if (!proxy) return results;
  const { sandbox } = map.proxies.get(proxy);
  return Reflect.ownKeys(sandbox).map((key) => sandbox[key]);
}
