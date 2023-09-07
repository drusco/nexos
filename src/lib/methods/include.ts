import Exotic from "../../types/Exotic.js";
import {
  map,
  traps,
  createProxy,
  decode,
  encode,
  constants,
  findProxy,
} from "../../utils/index.js";

export default function include(
  scope: Exotic.Emulator,
  encodedProxy: string,
  origin: Exotic.proxy.origin,
  target?: any,
): Exotic.Proxy {
  const decodedOrigin: Exotic.proxy.origin = decode(scope, origin);
  const { links } = map.emulators.get(scope);
  const { action, proxy, key, value, that, args } = decodedOrigin;

  if (action === "link") {
    // creates proxy by reference
    return createProxy(scope, decodedOrigin, links[key] || target);
  }

  if (action === "exec") {
    const prefix = "_$x";

    const code = target.replace(
      constants.HAS_PROXY_ID_REGEXP,
      (match: string, $1: string) => {
        const proxy = findProxy(decode(scope, $1));
        if (!proxy) return match;
        const { target } = map.proxies.get(proxy);
        if (target === constants.FUNCTION_TARGET) {
          return `(${prefix}.decode('${$1}'))`;
        }
        return `(${prefix}.target(${prefix}.decode('${$1}')))`;
      },
    );

    const program = new Function(prefix, `return (${code})(${prefix})`);
    return createProxy(scope, decodedOrigin, program(scope));
  }

  if (!action) {
    // creates proxy by target
    return createProxy(scope, decodedOrigin, target);
  }

  const { mock, sandbox } = map.proxies.get(proxy);
  let proxyFromTrap: Exotic.Proxy;

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

  if (encode(proxyFromTrap) !== encodedProxy) {
    links[encodedProxy] = proxyFromTrap;
  }

  return proxyFromTrap;
}
