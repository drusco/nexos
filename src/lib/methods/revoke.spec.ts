import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(method) revoke", () => {
  it("Revokes a single proxy", () => {
    const proxy = $.use();
    const inner = proxy.inner;

    $.revoke(proxy);

    expect(inner).not.toThrow();
    expect(proxy).toThrow();
    expect($.use(proxy)).toThrow();
    expect(() => proxy.inner).toThrow();
    expect(() => (proxy.inner = true)).toThrow();
    expect(() => delete proxy.inner).toThrow();
    expect(() => new proxy()).toThrow();
    expect(() => proxy.inner()).toThrow();
    expect($.use(inner)).toBe(inner);
  });

  it("Revokes and removes internal references", () => {
    const proxy = $.use();
    const inner = proxy.inner;

    $.revoke(inner);

    expect(proxy).not.toThrow();
    expect(inner).toThrow();
    expect($.use(inner)).toThrow();
    expect(() => new inner()).toThrow();
    expect(() => inner()).toThrow();
    expect($.use(proxy)).toBe(proxy);
    expect($.ownKeys(proxy).includes("inner")).toBe(false);
  });
});
