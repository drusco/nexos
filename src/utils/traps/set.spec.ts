import Emulator from "../../Emulator.js";
const $ = new Emulator();

describe("(trap) set", () => {
  it("Sets a value to the proxy and the target", () => {
    const target = { value: false };
    const proxy = $.use(target);

    proxy.value = true;

    expect(typeof proxy.value).toBe("function");
    expect(target.value).toBe(true);
    expect($.target(proxy.value)).toBe(true);
  });
});
