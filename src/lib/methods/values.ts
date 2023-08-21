import Exotic from "../../types/Exotic.js";
import { findProxy, map } from "../../utils/index.js";

export default function values(value?: Exotic.traceable): Exotic.Proxy[] {
  const proxy = findProxy(value);
  if (!proxy) return [];
  const { sandbox } = map.proxies.get(proxy);
  return Object.values(sandbox);
}
