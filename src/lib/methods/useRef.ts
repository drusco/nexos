import Exotic from "../../types/Exotic";
import { createProxy } from "../../utils";

export default function useRef(
  scope: Exotic.Emulator,
  key: Exotic.key,
  value?: any,
): Exotic.Proxy {
  // create a proxy by reference key
  return createProxy(scope, { ref: key }, value);
}
