import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(method) getId", () => {
  it("Returns the proxy's id ", () => {
    const totalProxies = $.length;
    const proxy = $.use();
    const another = $.use();

    expect($.getId(proxy)).toBe(totalProxies + 1);
    expect($.getId(another)).toBe(totalProxies + 2);
  });

  it("Returns NaN when the value is not linked to an identifier", () => {
    const totalProxies = $.length;
    const value = ["not_a_proxy"];

    expect($.getId(value)).toBe(NaN);
    expect($.length).toBe(totalProxies);
  });
});
