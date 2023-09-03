import Emulator from "../../Emulator.js";
const $ = new Emulator();

describe("(getter) links", () => {
  it("Returns an array of all reference links in use", () => {
    const reference = Date.now().toString();
    $.link(reference);
    expect($.links.includes(reference)).toBe(true);
  });
});
