import Emulator from "../../Emulator.js";
const $ = new Emulator();

describe("(method) target", () => {
  it("Returns the target used by a proxy", () => {
    const target = "$%&Test";
    const proxy = $.use(target);
    const targetFromProxy = $.target(proxy);
    expect(target).toBe(targetFromProxy);
  });

  it("Returns the target from an apply call on the original target", () => {
    const proxy = $.use("abc");
    const proxy2 = proxy.substring(1);

    expect($.target(proxy2)).toBe("bc");
  });

  it("Returns the target from inner properties", () => {
    const reference = [1, 2, 3, $.use(), {}];
    const proxy = $.use(reference);

    proxy.push("test");

    expect($.target(proxy[0])).toBe(1);
    expect($.target(proxy[1])).toBe(2);
    expect($.target(proxy[2])).toBe(3);
    expect(proxy[3]).toBe(reference[3]);
    expect($.target(proxy[$.target(proxy.length) - 1])).toBe("test");
    expect(typeof proxy[reference.length - 1]).toBe("function");

    expect(reference.length).toBe(6);
    expect($.target(proxy.length)).toBe(reference.length);
    expect($.target(proxy.pop())).toBe("test");
    expect(reference.length).toBe(5);
    expect($.target(proxy.length)).toBe(reference.length);
  });
});
