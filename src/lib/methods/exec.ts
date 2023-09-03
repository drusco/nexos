import Exotic from "../../types/Exotic.js";
import { createProxy, encode } from "../../utils/index.js";

export default function exec(
  scope: Exotic.Emulator,
  method: Exotic.FunctionLike,
  dependencies: Record<string, Exotic.Proxy> = {},
): Exotic.Proxy {
  let target = method.toString();
  const keys = Object.keys(dependencies);
  keys.sort((a, b) => b.length - a.length);
  keys.forEach((key) => {
    target = target.replaceAll(key, encode(dependencies[key]));
  });
  return createProxy(scope, { action: "exec" }, target);
}
