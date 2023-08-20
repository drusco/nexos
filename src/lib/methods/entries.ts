import Exotic from "../../types/Exotic.js";
import { proxyIterator } from "../../utils/index.js";

export default function entries(): IterableIterator<Exotic.Proxy> {
  return proxyIterator();
}
