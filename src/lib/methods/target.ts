import { findProxy, map } from "../../utils";

export default function target(value?: any): any {
  const proxy = findProxy(value);
  if (!proxy) return value;
  const { target } = map.proxies.get(proxy);
  return target;
}
