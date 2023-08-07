import Emulator from "../../Emulator";
import Exotic from "../../types/Exotic";

let $: Exotic.Emulator;

const payload = (value?: any, encoded: boolean = true): Exotic.payload => {
  return { value, encoded };
};

describe("(method) encode", () => {
  it("Encodes a proxy into a payload object", () => {
    const proxy = $.use();
    const mock: Exotic.payload = payload(1);
    expect($.encode(proxy)).toEqual(mock);
  });

  it("Encodes proxies into payload objects deeply", () => {
    const proxy = $.use();
    const second = proxy.second;
    const third = proxy.second.third;
    const value = [proxy, second, third, [[[third.fourth]]]];
    const mock: Exotic.payload = payload(
      [
        payload(1),
        payload(2),
        payload(3),
        payload([payload([payload([payload(4)], false)], false)], false),
      ],
      false,
    );
    expect($.encode(value)).toEqual(mock);
  });
});

beforeEach(() => {
  $ = new Emulator();
});
