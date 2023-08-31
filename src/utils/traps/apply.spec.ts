import Emulator from "../../Emulator.js";
const $ = new Emulator();

describe("(trap) apply", () => {
  it("Returns a new proxy from a proxy's function call when the target isn't a function", () => {
    const proxy = $.use();
    const currentProxies = $.length;
    const returnValue = proxy();

    expect(typeof returnValue).toBe("function");
    expect($.length).toBe(currentProxies + 1);
  });

  it("Returns a proxy from the target's return value when the target is a function", () => {
    const target = (value: number) => value / 2;
    const proxy = $.use(target);
    const five = proxy(10);

    expect(typeof proxy).toBe("function");
    expect(typeof five).toBe("function");
    expect($.target(five)).toBe(5);
  });
});
