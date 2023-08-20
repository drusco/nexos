import Exotic from "../../types/Exotic.js";
import {
  map,
  traps,
  createProxy,
  decode,
  findProxy,
} from "../../utils/index.js";

export default function include(
  scope: Exotic.Emulator,
  origin: Exotic.proxy.origin,
  target?: any,
): any {
  const decodedOrigin = decode(scope, origin);
  const decodedTarget = decode(scope, target);
  const targetProxy = findProxy(decodedTarget);
  const newTarget = targetProxy ? targetProxy : target;
  const { action, proxy, key, value, that, args, ref } = decodedOrigin;
  const { options } = map.emulators.get(scope);

  if (ref) {
    // creates proxy by reference
    return new Promise((resolve) => {
      scope.emit("reference", ref, (target: any) => {
        createProxy(scope, decodedOrigin, target);
        resolve(undefined);
      });
      setTimeout(() => {
        createProxy(scope, decodedOrigin, newTarget);
        resolve(undefined);
      }, options.responseTimeout);
    });
  }

  if (!action) {
    // creates proxy by target
    return createProxy(scope, decodedOrigin, newTarget);
  }

  const originData = map.proxies.get(proxy);

  if (!originData) {
    return;
  }

  const { mock } = originData;

  switch (action) {
    case "get":
      if (!key) return;
      return traps.get(mock, key);
    case "set":
      if (!key) return false;
      return traps.set(mock, key, value);
    case "apply":
      return traps.apply(mock, that, args);
    case "construct":
      return traps.construct(mock, args);
  }
}
