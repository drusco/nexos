import Emulator from "../../Emulator.js";
const $ = new Emulator();

describe("(trap) deleteProperty", () => {
  it("Deletes a property from a proxy and its original target", () => {
    const target = { value: false };
    const proxy = $.use(target);

    expect($.target(proxy.value)).toBe(false);
    expect(target.value).toBe(false);

    delete proxy.value;

    expect(target.value).toBeUndefined();
    expect($.target(proxy.value)).toBeUndefined();
  });
});
