import Exotic from "../types/Exotic.js";
import map from "./map.js";
import findProxy from "./findProxy.js";
import isTraceable from "./isTraceable.js";
import isPayload from "./isPayload.js";
import mockPrototype from "./mockPrototype.js";
import traps from "./traps/index.js";
import encode from "./encode.js";
import findProxyById from "./findProxyById.js";

const createProxy = (
  scope: Exotic.Emulator,
  origin: Exotic.proxy.origin,
  target?: any,
): Exotic.Proxy => {
  // find proxy by id

  if (isPayload(target)) {
    const proxyFromPayload = findProxyById(scope, target);
    if (proxyFromPayload) {
      return proxyFromPayload;
    }
  }

  const data: Exotic.emulator.data = map.emulators.get(scope);
  const { links, options, proxySet } = data;
  const error = options.traceErrors ? new Error() : undefined;
  const link = origin.action === "link" ? origin.key : undefined;
  const validLink = link !== undefined;
  const encodedOrigin = encode(origin);
  const encodedTarget = encode(target);

  // find proxy by link reference

  if (validLink) {
    const proxyRef = links[link];
    if (proxyRef) {
      scope.emit(
        "proxy",
        `⁠${map.proxies.get(proxyRef).id}`,
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
      `⁠${map.proxies.get(usableProxy).id}`,
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

  let { proxy, revoke } = Proxy.revocable<Exotic.Proxy>(mock, traps);

  if (validLink) {
    // create unique reference
    links[link] = proxy;
  }

  // add information about this proxy
  const proxyData: Exotic.proxy.data = {
    id: `${++data.counter}`,
    mock,
    origin,
    target,
    scope,
    key: link,
    revoked: false,
    sandbox: Object.create(null),
    revoke() {
      revoke && revoke();
      proxy = null;
      revoke = null;
    },
  };

  map.mocks.set(mock, proxy);
  map.proxies.set(proxy, proxyData);
  proxySet.add(proxy);

  if (isTraceable(target)) {
    map.targets.set(target, proxy);
  }

  scope.emit("proxy", `⁠${proxyData.id}`, encodedOrigin, encodedTarget, error);
  return proxy;
};

export default createProxy;
