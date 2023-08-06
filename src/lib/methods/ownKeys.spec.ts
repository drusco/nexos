import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(method) ownKeys", () => {
  it("Returns an Array of the proxy's own property keys, including strings and symbols", () => {
    const proxy = $.use();
    const symbol = Symbol();

    proxy.a = true;
    proxy.b = true;
    proxy[symbol] = true;

    const keys = $.ownKeys(proxy);

    expect(keys.length).toBe(3);
    expect(keys.includes("a")).toBe(true);
    expect(keys.includes("b")).toBe(true);
    expect(keys.includes(symbol)).toBe(true);
  });
});
