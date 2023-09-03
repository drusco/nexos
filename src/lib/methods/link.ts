import Exotic from "../../types/Exotic.js";
import { createProxy } from "../../utils/index.js";

export default function link(
  scope: Exotic.Emulator,
  key: Exotic.key,
  value?: any,
): Exotic.Proxy {
  // create a proxy by link reference
  return createProxy(scope, { action: "link", key }, value);
}
