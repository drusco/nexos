import Exotic from "../../types/Exotic";
import { findProxy } from "../../utils";

export default async function get(
  scope: Exotic.Emulator,
  value?: any,
): Promise<any> {
  const proxy = findProxy(value);
  if (!proxy) return value;
  return 600;
}
