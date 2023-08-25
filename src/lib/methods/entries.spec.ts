import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(method) entries", () => {
  it("Returns an iterator that contains the active (non revoked) proxies", () => {
    const activeProxies = $.length;
    const entries = [...$.entries()].length;
    const proxy = $.use();
    const newProxies = [proxy];

    newProxies.push(proxy.child, proxy.inner, proxy.inner.child);

    expect(activeProxies).toBe(entries);
    expect($.length).toBe(entries + newProxies.length);
    expect([...$.entries()].length).toBe(entries + newProxies.length);
  });
});
