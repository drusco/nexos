import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(trap) get", () => {
  it("Returns a new or existing proxy for the target's property", () => {
    const proxy = $.use();
    const inner = proxy.inner;
    expect(typeof inner).toBe("function");
    expect(proxy.inner).toBe(inner);
  });
});
