import Exotic from "../types/Exotic.js";
import map from "./map.js";
import findProxy from "./findProxy.js";
import isTraceable from "./isTraceable.js";
import mockPrototype from "./mockPrototype.js";
import traps from "./traps/index.js";
import encode from "./encode.js";

const createProxy = (
  scope: Exotic.Emulator,
  origin: Exotic.proxy.origin = {},
  target?: any,
): Exotic.Proxy => {
  const data: Exotic.emulator.data = map.emulators.get(scope);
  const { refs, options, proxySet } = data;
  const error = options.traceErrors ? new Error() : undefined;

  const usableProxy = findProxy(target);
  const encodedOrigin = encode(origin);
  const encodedTarget = encode(target);

  if (usableProxy) {
    // proxy already exists
    if (origin.action) {
      data.counter++;
    }
    scope.emit(
      "proxy",
      encode(usableProxy),
      encodedOrigin,
      encodedTarget,
      error,
    );
    return usableProxy;
  }

  const refKey = origin.action === "link" ? origin.key : undefined;
  const validRefKey = refKey !== undefined;
  const reference = validRefKey ? refKey : undefined;

  if (validRefKey) {
    // proxy reference exists
    const proxyRef = refs[reference];
    if (proxyRef) {
      scope.emit(
        "proxy",
        encode(proxyRef),
        encodedOrigin,
        encodedTarget,
        error,
      );
      return proxyRef;
    }
  }

  // create new proxy

  const mock = Object.setPrototypeOf(
    function () {},
    mockPrototype,
  ) as Exotic.Mock;

  let { proxy, revoke } = Proxy.revocable<Exotic.Proxy>(mock, traps);

  const id = ++data.counter;
  const sandbox = Object.create(null);

  const revokeFunction = () => {
    revoke && revoke();
    proxy = null;
    revoke = null;
  };

  if (validRefKey) {
    // create unique reference
    refs[reference] = proxy;
  }

  // proxy information
  const proxyData: Exotic.proxy.data = {
    id,
    mock,
    origin,
    target,
    revoke: revokeFunction,
    scope,
    sandbox,
    key: reference,
    revoked: false,
  };

  map.mocks.set(mock, proxy);
  map.proxies.set(proxy, proxyData);
  proxySet.add(proxy);

  if (isTraceable(target)) {
    map.targets.set(target, proxy);
  }

  scope.emit("proxy", encode(proxy), encodedOrigin, encodedTarget, error);
  return proxy;
};

export default createProxy;
