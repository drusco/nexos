import Exotic from "../../types/Exotic";
import { proxyIterator } from "../../utils";

export default function entries(): IterableIterator<Exotic.Proxy> {
  return proxyIterator();
}
