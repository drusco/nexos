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

  if (!originData) {
    return;
  }

  const { mock, sandbox } = originData;

  switch (action) {
    case "get":
      if (!key) return;
      return traps.get(mock, key);
    case "set":
      if (!key) return;
      traps.set(mock, key, value);
      return sandbox[key];
    case "apply":
      return traps.apply(mock, that, args);
    case "construct":
      return traps.construct(mock, args);
  }
}
