import Exotic from "../../types/Exotic.js";
import { map, traps, createProxy, decode, encode } from "../../utils/index.js";

export default function include(
  scope: Exotic.Emulator,
  encodedProxy: string,
  origin: Exotic.proxy.origin,
  target?: any,
): any {
  const decodedOrigin: Exotic.proxy.origin = decode(scope, origin);
  const { links } = map.emulators.get(scope);
  const { action, proxy, key, value, that, args } = decodedOrigin;
  const originData = map.proxies.get(proxy);

  if (action === "link") {
    // creates proxy by reference
    return createProxy(scope, decodedOrigin, links[key] || target);
  }

  if (action === "exec") {
    const decodedTarget = decode(scope, target);
    const program = new Function("$", `return (${decodedTarget})($)`);
    return createProxy(scope, decodedOrigin, program(scope));
  }

  if (!action) {
    // creates proxy by target
    return createProxy(scope, decodedOrigin, target);
  }

  if (!originData) {
    return;
  }

  const { mock, sandbox } = originData;
  let proxyFromTrap: Exotic.Proxy | undefined;

  switch (action) {
    case "get":
      proxyFromTrap = traps.get(mock, key);
      break;
    case "set":
      traps.set(mock, key, value);
      proxyFromTrap = sandbox[key];
      break;
    case "apply":
      proxyFromTrap = traps.apply(mock, that, args);
      break;
    case "build":
      proxyFromTrap = traps.construct(mock, args);
      break;
  }

  if (proxyFromTrap) {
    if (encode(proxyFromTrap) !== encodedProxy) {
      links[encodedProxy] = proxyFromTrap;
    }
  }

  return proxyFromTrap;
}
