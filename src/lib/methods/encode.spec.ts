import Emulator from "../../Emulator.js";
import constants from "../../utils/constants.js";
const $ = new Emulator();

describe("(method) encode", () => {
  it("Encodes a proxy into a payload object", () => {
    const proxy = $.use();
    const mock = `${constants.NO_BREAK}1`;
    expect($.encode(proxy)).toEqual(mock);
  });

  it("Encodes proxies into payload objects deeply", () => {
    const deep = $.use();
    const value = [[[[{ deep }]]]];
    const mock = [[[[{ deep: `${constants.NO_BREAK}2` }]]]];
    expect($.encode(value)).toEqual(mock);
  });
});
