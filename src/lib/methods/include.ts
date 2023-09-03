import Exotic from "../../types/Exotic.js";
import {
  map,
  traps,
  createProxy,
  decode,
  encode,
  findProxy,
} from "../../utils/index.js";

export default function include(
  scope: Exotic.Emulator,
  encodedProxy: string,
  origin: Exotic.proxy.origin,
  target?: any,
): any {
  const decodedOrigin: Exotic.proxy.origin = decode(scope, origin);
  const decodedTarget = decode(scope, target);
  const proxyAsTarget = findProxy(decodedTarget);
  const newTarget = proxyAsTarget ? proxyAsTarget : target;
  const { links } = map.emulators.get(scope);
  const { action, proxy, key, value, that, args } = decodedOrigin;
  const originData = map.proxies.get(proxy);

  if (action === "link") {
    // creates proxy by reference
    return createProxy(
      scope,
      decodedOrigin,
      links[key] === undefined ? target : links[key],
    );
  }

  if (action === "exec") {
    const program = new Function("$", `return (${decodedTarget})($)`);
    return createProxy(scope, decodedOrigin, program(scope));
  }

  if (!action) {
    // creates proxy by target
    return createProxy(scope, decodedOrigin, newTarget);
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
    const localEncodedProxy = encode(proxyFromTrap);
    if (localEncodedProxy !== encodedProxy) {
      links[encodedProxy] = localEncodedProxy;
    }
  }

  return proxyFromTrap;
}
