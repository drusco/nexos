import Exotic from "../../types/Exotic.js";
import { createProxy } from "../../utils/index.js";

export default function useRef(
  scope: Exotic.Emulator,
  key: Exotic.key,
  value?: any,
): Exotic.Proxy {
  // create a proxy by reference key
  return createProxy(scope, { ref: key }, value);
}
