import Emulator from "../../Emulator";
import Exotic from "../../types/Exotic";
const $ = new Emulator();

describe("(method) encode", () => {
  it("encodes values into payload objects", () => {
    const proxy = $.use();
    const inner = proxy.inner;
    const test = proxy.inner.test;
    const value = [proxy, inner, test];
    const mock: Exotic.payload = {
      proxy: false,
      value: [
        {
          proxy: true,
          value: 1,
        },
        {
          proxy: true,
          value: 2,
        },
        {
          proxy: true,
          value: 3,
        },
      ],
    };
    expect($.encode(value)).toEqual(mock);
  });
});
