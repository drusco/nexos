import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(method) entriesAfter", () => {
  it("Returns an iterator that contains the active proxies created after a certain proxy", () => {
    const proxy = $.use();
    const newProxies: any[] = [];

    newProxies.push(proxy.child, proxy.inner, proxy.inner.child);

    expect([...$.entriesAfter(proxy)].length).toBe(newProxies.length);
  });
});
