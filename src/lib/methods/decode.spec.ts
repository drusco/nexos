import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(method) decode", () => {
  it("Decodes a proxy payload into the original proxy", () => {
    const proxy = $.use();
    const mock = "⁠1";
    expect($.decode(mock)).toBe(proxy);
  });

  it("Decodes every proxy found within the payload deeply", () => {
    const deep = $.use();
    const value = [[[[{ deep }]]]];
    const mock = [[[[{ deep: "⁠2" }]]]];
    expect($.decode(mock)).toEqual(value);
  });
});
