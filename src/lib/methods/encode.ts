import Exotic from "../../types/Exotic";
import { findProxy, map } from "../../utils";

export default function encode(
  scope: Exotic.Emulator,
  value: any,
): Exotic.payload {
  const proxy = findProxy(value);
  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const result: Exotic.payload = { value, encoded: false };

  if (proxy) {
    result.encoded = true;
    result.value = map.proxies.get(proxy).id;
  }

  if (isObject) {
    const copy = isArray ? [] : {};

    for (const key in value) {
      copy[key] = encode(scope, value[key]);
    }

    result.value = copy;
  }

  return result;
}
