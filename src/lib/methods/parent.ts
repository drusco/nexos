import Exotic from "../../types/Exotic";
import { findProxy, map } from "../../utils";

export default function parent(
  scope: Exotic.Emulator,
  value?: Exotic.traceable,
): undefined | Exotic.Proxy {
  const proxy = findProxy(value);
  if (!proxy) return;
  const { origin } = map.proxies.get(proxy);
  return origin && origin.proxy;
}
