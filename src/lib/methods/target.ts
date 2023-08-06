import Exotic from "../../types/Exotic";
import { findProxy, map } from "../../utils";

export default function target(scope: Exotic.Emulator, value?: any): any {
  const proxy = findProxy(value);
  if (!proxy) return value;
  const { target } = map.proxies.get(proxy);
  return target;
}
