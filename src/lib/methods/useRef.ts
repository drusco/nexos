import Exotic from "../../types/Exotic";
import { createProxy, map } from "../../utils";

export default function useRef(
  scope: Exotic.Emulator,
  key: Exotic.key,
): Exotic.Proxy {
  const { refs }: Exotic.emulator.data = map.emulators.get(scope);
  const proxyRef = refs[key];

  // return proxy by reference
  if (proxyRef) return proxyRef;

  // create a proxy by reference key
  return createProxy(scope, undefined, key);
}
