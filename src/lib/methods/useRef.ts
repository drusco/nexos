import Exotic from "../../types/Exotic";
import { createProxy } from "../../utils";

export default function useRef(
  scope: Exotic.Emulator,
  key: Exotic.key,
): Exotic.Proxy {
  // create a proxy by reference key
  return createProxy(scope, undefined, undefined, key);
}
