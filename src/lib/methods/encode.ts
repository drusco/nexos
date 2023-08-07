import Exotic from "../../types/Exotic";
import { getPayload } from "../../utils";

export default function encode(
  scope: Exotic.Emulator,
  value: any,
): Exotic.payload {
  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const result: Exotic.payload = getPayload(scope, value);

  if (isObject) {
    const copy = isArray ? [] : {};

    for (const key in value) {
      copy[key] = encode(scope, value[key]);
    }

    result.value = copy;
  }

  return result;
}
