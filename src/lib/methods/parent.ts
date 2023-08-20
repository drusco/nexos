import Exotic from "../../types/Exotic.js";
import { findProxy, map } from "../../utils/index.js";

export default function parent(
  value?: Exotic.traceable,
): undefined | Exotic.Proxy {
  const proxy = findProxy(value);
  if (!proxy) return;
  const { origin } = map.proxies.get(proxy);
  return origin && origin.proxy;
}
