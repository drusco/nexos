import Exotic from "../../types/Exotic.js";
import { proxyIterator } from "../../utils/index.js";

export default function entries(
  scope: Exotic.Emulator,
): IterableIterator<Exotic.Proxy> {
  return proxyIterator(scope);
}
