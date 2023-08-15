import Exotic from "../types/Exotic";
import findProxy from "./findProxy";
import map from "./map";

export default function encode(value: any): any {
  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const proxy = findProxy(value);

  let result = value;

  if (proxy) {
    result = ["⁠", map.proxies.get(proxy).id] as Exotic.ProxyPayload;
  } else if (isObject) {
    const copy = isArray ? [] : {};

    for (const key in value) {
      copy[key] = encode(value[key]);
    }

    result = copy;
  }

  return result;
}
