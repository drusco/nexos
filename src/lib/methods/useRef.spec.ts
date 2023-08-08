import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(method) useRef", () => {
  it("Can access a proxy using a string", () => {
    const ref = "test";
    const proxy = $.useRef(ref);

    expect(proxy).toBe($.useRef(ref));
  });

  it("Can access a proxy using a symbol", () => {
    const ref = Symbol();
    const proxy = $.useRef(ref);

    expect(proxy).toBe($.useRef(ref));
  });

  it("Allows empty string as reference key", () => {
    const ref = "";
    const proxy = $.useRef(ref);

    expect(proxy).toBe($.useRef(ref));
  });

  it("Allows a target value as a second parameter", () => {
    const ref = "ref_and_target";
    const target = [];
    const proxy = $.useRef(ref, target);

    expect(proxy).toBe($.useRef(ref));
    expect($.target(proxy)).toBe(target);
  });
});
