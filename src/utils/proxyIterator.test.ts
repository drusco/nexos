import ProxyNexo from "../lib/ProxyNexo.js";
import { proxyIterator } from "./index.js";

const nexo = new ProxyNexo();

describe("proxyIterator", () => {
  it("Returns an iterable iterator of proxies", () => {
    const foo = nexo.createProxy();
    const bar = nexo.createProxy();

    const iterator = proxyIterator(nexo);
    const proxies = [...iterator];

    expect(proxies.length).toBe(2);
    expect(proxies.includes(foo)).toBe(true);
    expect(proxies.includes(bar)).toBe(true);
  });
});
