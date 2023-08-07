import Exotic from "../types/Exotic";
import findProxy from "./findProxy";

export default function getPayload(
  scope: Exotic.Emulator,
  value?: any,
): Exotic.payload {
  const proxy = findProxy(value);
  const result = proxy ? scope.getId(proxy) : value;
  return { value: result, encoded: !!proxy };
}
