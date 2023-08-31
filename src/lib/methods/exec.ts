import Exotic from "../../types/Exotic.js";
import encode from "./encode.js";
import createProxy from "../../utils/createProxy.js";

export default function exec(
  scope: Exotic.Emulator,
  func: Exotic.FunctionLike,
  map: Record<string, Exotic.Proxy> = {},
): Exotic.Proxy {
  let target = func.toString();
  const keys = Object.keys(map);
  keys.sort((a, b) => b.length - a.length);
  keys.forEach((key) => {
    target = target.replaceAll(key, encode(map[key]));
  });
  return createProxy(scope, { action: "exec" }, target);
}
