import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(trap) apply", () => {
  it("Gets a proxy from an apply trap when target is not a function", () => {
    const proxy = $.use();
    expect(typeof proxy()).toBe("function");
  });

  it("Gets a value from an apply trap when target is a function", () => {
    const proxy = $.use((value: number) => value / 2);
    expect($.target(proxy(10))).toBe(5);
  });
});
