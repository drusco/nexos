import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(method) $.useRef", () => {
  it("Can access a proxy using a string", () => {
    const key = "test";
    const proxy = $.useRef(key);
    expect(proxy).toBe($.useRef(key));
  });

  it("Can access a proxy using a symbol", () => {
    const key = Symbol();
    const proxy = $.useRef(key);
    expect(proxy).toBe($.useRef(key));
  });

  it("Allows empty string as reference key", () => {
    const key = "";
    const proxy = $.useRef(key);
    expect(proxy).toBe($.useRef(key));
  });
});
