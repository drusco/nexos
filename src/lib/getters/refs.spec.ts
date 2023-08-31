import Emulator from "../../Emulator.js";
const $ = new Emulator();

describe("(getter) refs", () => {
  it("Returns an array of all reference keys in use", () => {
    const reference = Date.now().toString();
    $.link(reference);
    expect($.refs.includes(reference)).toBe(true);
  });
});
