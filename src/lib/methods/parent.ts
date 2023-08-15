import Exotic from "../../types/Exotic";
import { findProxy, map } from "../../utils";
import decode from "../../utils/decode";

export default function parent(
  value?: Exotic.traceable,
): undefined | Exotic.Proxy {
  const proxy = findProxy(value);
  if (!proxy) return;
  const { origin, scope } = map.proxies.get(proxy);
  const decodedOrigin = decode(scope, origin) as Exotic.proxy.origin;
  return decodedOrigin && decodedOrigin.proxy;
}
