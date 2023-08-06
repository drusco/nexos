import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(trap) set", () => {
  it("Adds a value to the original target", () => {
    const proxy = $.use();
    const deep = { test: true, prox: true };

    proxy.set = { object: true };
    proxy.set.sub = {};
    proxy.set.sub.deep = deep;
    proxy.set.sub.deep.test = false;
    $.use(deep).test = null;
    $.use(deep).prox = $.use("test");

    expect(deep.test).toBe(null);
    expect($.target($.use(deep).test)).toBe(null);
    expect(deep.prox).toBe("test");
  });
});
