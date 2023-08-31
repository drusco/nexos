import Emulator from "../../Emulator.js";
const $ = new Emulator();

describe("(method) link", () => {
  it("Can access a proxy using a string", () => {
    const ref = "test";
    const proxy = $.link(ref);

    expect(proxy).toBe($.link(ref));
  });

  it("Allows empty string as reference key", () => {
    const ref = "";
    const proxy = $.link(ref);

    expect(proxy).toBe($.link(ref));
  });

  it("Allows a target value as a second parameter", () => {
    const ref = "ref_and_target";
    const target = [];
    const proxy = $.link(ref, target);

    expect(proxy).toBe($.link(ref));
    expect($.target(proxy)).toBe(target);
  });
});
