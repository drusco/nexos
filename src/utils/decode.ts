import Exotic from "../types/Exotic";
import findProxy from "./findProxy";
import findProxyById from "./findProxyById";
import isPayload from "./isPayload";

export default function decode(scope: Exotic.Emulator, value: any): any {
  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const proxy = findProxy(value);
  const payload = isPayload(value);

  let result = value;

  if (proxy) {
    result = proxy;
  } else if (payload) {
    result = findProxyById(scope, value[1]);
  } else if (isObject) {
    const copy = isArray ? [] : {};

    for (const key in value) {
      copy[key] = decode(scope, value[key]);
    }

    result = copy;
  }

  return result;
}
