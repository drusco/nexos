import getProxyMap from "./getProxyMap.js";

describe("getProxyMap", () => {
  it("returns a reference to the proxies WeakMap", () => {
    const map = getProxyMap();
    const proxyMap = getProxyMap();

    expect(map).toBe(proxyMap);
    expect(map).toBeInstanceOf(WeakMap);
  });
});
