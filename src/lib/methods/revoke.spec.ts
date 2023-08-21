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
    expect($.keys(proxy).includes("inner")).toBe(false);
  });

  it("Removes the reference binded to a proxy", () => {
    const ref = "myref";
    const proxy = $.useRef(ref);
    const inner = proxy.inner;
    const deep = proxy.inner.inner;

    $.revoke(proxy);

    expect($.refs.includes(ref)).toBe(false);
    expect($.useRef(ref)).not.toBe(proxy);
    expect($.useRef(ref)).not.toBe(inner);
    expect($.useRef(ref)).not.toBe(deep);
  });
});
