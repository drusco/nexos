import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(getter) active", () => {
  it("Returns the number of active proxies", () => {
    const active = $.active;
    $.use();
    expect($.active).toBe(active + 1);
  });
});
