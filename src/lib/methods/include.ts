import Exotic from "../../types/Exotic";
import { map, traps, createProxy, decode } from "../../utils";

export default function include(
  scope: Exotic.Emulator,
  origin: Exotic.proxy.origin,
  target?: any,
): void {
  const decodedOrigin = decode(scope, origin);
  const { action, proxy, key, value, that, args, ref } = decodedOrigin;

  if (ref) {
    new Promise((resolve) => {
      scope.emit("reference", ref, (target: any) => {
        createProxy(scope, decodedOrigin, target);
        resolve(undefined);
      });
    });
    return;
  }

  if (!action) {
    createProxy(scope, decodedOrigin, target);
    return;
  }

  const originProxy = map.proxies.get(proxy);

  if (!originProxy) {
    return;
  }

  const { mock } = originProxy;

  switch (action) {
    case "get":
      if (!key) return;
      traps.get(mock, key);
      break;
    case "set":
      if (!key) return;
      traps.set(mock, key, value);
      break;
    case "apply":
      traps.apply(mock, that, args);
      break;
    case "construct":
      traps.construct(mock, args);
      break;
  }
}
