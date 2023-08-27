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
  const decodedOrigin = decode(scope, origin);
  const decodedTarget = decode(scope, target);
  const proxyAsTarget = findProxy(decodedTarget);
  const newTarget = proxyAsTarget ? proxyAsTarget : target;
  const { action, proxy, key, value, that, args, ref } = decodedOrigin;

  if (ref) {
    // creates proxy by reference
    return new Promise((resolve) => {
      let done = false;
      scope.emit("reference", ref, (target: any) => {
        done = true;
        createProxy(scope, decodedOrigin, target);
        resolve(undefined);
      });
      if (done) return;
      createProxy(scope, decodedOrigin, newTarget);
      resolve(undefined);
    });
  }

  if (!action) {
    // creates proxy by target
    return createProxy(scope, decodedOrigin, newTarget);
  }

  const originData = map.proxies.get(proxy);
  const { links } = map.emulators.get(scope);

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
    case "construct":
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
