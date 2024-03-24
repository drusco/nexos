import ProxyNexo from "../lib/ProxyNexo.js";
import { weakRefIterator } from "./index.js";

const nexo = new ProxyNexo();

describe("weakRefIterator", () => {
  it("Returns an iterable iterator of weakref values", () => {
    const foo = nexo.createProxy();
    const bar = nexo.createProxy();

    const iterator = weakRefIterator(nexo.entries);
    const proxies = [...iterator];

    expect(proxies.length).toBe(2);
    expect(proxies.includes(foo)).toBe(true);
    expect(proxies.includes(bar)).toBe(true);
  });
});
