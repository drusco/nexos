import Exotic from "../types/Exotic.js";
import map from "./map.js";
import findProxy from "./findProxy.js";
import isTraceable from "./isTraceable.js";
import isProxyPayload from "./isProxyPayload.js";
import mockPrototype from "./mockPrototype.js";
import traps from "./traps/index.js";
import encode from "./encode.js";
import findProxyById from "./findProxyById.js";
import constants from "./constants.js";

const createProxy = (
  scope: Exotic.Emulator,
  origin: Exotic.proxy.origin = {},
  target?: unknown,
): Exotic.Proxy => {
  // find proxy by payload

  if (isProxyPayload(target)) {
    const proxyById = findProxyById(scope, target);
    if (proxyById) return proxyById;
  }

  const data: Exotic.emulator.data = map.emulators.get(scope);
  const { links, options, proxySet } = data;
  const error = options.traceErrors ? new Error() : undefined;
  const link = origin.action === "link" ? origin.key : undefined;
  const validLink = link !== undefined;
  const encodedOrigin = encode(origin);
  let encodedTarget = encode(target);

  // find proxy by link reference

  if (validLink) {
    const proxyRef = links[link];
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

  // find a proxy that already exists

  const usableProxy = findProxy(target);

  if (usableProxy) {
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

  // create a new proxy

  const mock = Object.setPrototypeOf(
    function () {},
    mockPrototype,
  ) as Exotic.Mock;

  const { proxy, revoke } = Proxy.revocable<Exotic.Proxy>(mock, traps);
  const targetIsFunction = typeof target === "function";

  // add information about this proxy
  const proxyData: Exotic.proxy.data = {
    id: `${++data.counter}`,
    mock,
    origin,
    target,
    scope,
    link,
    revoked: false,
    sandbox: Object.create(null),
    revoke,
  };

  map.mocks.set(mock, proxy);
  map.proxies.set(proxy, proxyData);
  proxySet.add(proxy);

  if (isTraceable(target)) {
    map.targets.set(target, proxy);
  }

  if (validLink) {
    // create unique reference
    links[link] = proxy;
  }

  if (targetIsFunction) {
    encodedTarget = constants.FUNCTION_TARGET;
  }

  scope.emit(
    "proxy",
    `${constants.NO_BREAK + proxyData.id}`,
    encodedOrigin,
    encodedTarget,
    error,
  );
  return proxy;
};

export default createProxy;
