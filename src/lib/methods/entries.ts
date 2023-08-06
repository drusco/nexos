import Exotic from "../../types/Exotic";
import { proxyGenerator } from "../../utils";

export default function* entries(
  scope: Exotic.Emulator,
): Iterable<Exotic.Proxy> {
  for (const proxy of proxyGenerator(scope)) {
    yield proxy;
  }
}
