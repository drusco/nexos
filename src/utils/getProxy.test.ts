import Nexo from "../lib/Nexo.js";
import nx from "../lib/types/Nexo.js";
import { getProxy } from "./index.js";
import map from "../lib/maps.js";

const nexo = new Nexo();

describe("getProxy", () => {
  it("Creates a new proxy with custom data", () => {
    const proxy = getProxy(nexo);

    testProxyData(proxy);
  });

  it("Creates a new proxy with custom data and a target", () => {
    const arrayTarget = [];
    const proxy = getProxy(nexo, arrayTarget);

    testProxyData(proxy, arrayTarget);
  });

  it("Creates a new proxy with a custom id", () => {
    const target = undefined;
    const customId = "foo";
    const proxy = getProxy(nexo, target, "foo");

    testProxyData(proxy, target, customId);
  });

  it("Links internal data using weak maps", () => {
    const target = [];
    const proxy = getProxy(nexo);
    const proxyWithTarget = getProxy(nexo, target);
    const proxyData = map.proxies.get(proxy);
    const proxyWithTargetData = map.proxies.get(proxyWithTarget);

    expect(map.proxies.has(proxy)).toBe(true);
    expect(map.proxies.has(proxyWithTarget)).toBe(true);
    expect(map.tracables.has(proxyData.wrapper)).toBe(true);
    expect(map.tracables.has(proxyWithTargetData.wrapper)).toBe(true);
    expect(map.tracables.has(target)).toBe(true);
  });

  it("Returns an existing proxy", () => {
    const target = [];
    const proxy = getProxy(nexo);
    const proxyWithTarget = getProxy(nexo, target);

    expect(getProxy(nexo, proxy)).toBe(proxy);
    expect(getProxy(nexo, proxyWithTarget)).toBe(proxyWithTarget);
    expect(getProxy(nexo, target)).toBe(proxyWithTarget);
  });
});

function testProxyData(
  proxy: nx.Proxy,
  proxyTarget: nx.traceable | void,
  proxyId: string | void,
) {
  const { id, scope, wrapper, sandbox, isExtensible, target } =
    map.proxies.get(proxy);

  const $id = proxyId || id;

  expect(typeof id).toBe("string");
  expect($id).toBe(id);
  expect(typeof wrapper).toBe("function");
  expect(scope).toBe(nexo);
  expect(sandbox).toBeInstanceOf(Map);
  expect(isExtensible).toBe(true);
  expect(target).toBe(proxyTarget);
}
