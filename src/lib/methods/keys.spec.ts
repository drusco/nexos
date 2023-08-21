import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(method) keys", () => {
  it("Returns an Array of the proxy's own property key strings", () => {
    const proxy = $.use();

    proxy.a = true;
    proxy.b = true;

    const keys = $.keys(proxy);

    expect(keys.length).toBe(2);
    expect(keys.includes("a")).toBe(true);
    expect(keys.includes("b")).toBe(true);
  });
});
