import Emulator from "../../Emulator";
import Exotic from "../../types/Exotic";

const $ = new Emulator();

describe("(method) get", () => {
  it("Gets the external value of a proxy", async () => {
    const proxy = $.use();
    const expected = 2200;

    $.on("get", (value: any, use: Exotic.FunctionLike) => {
      if ($.decode(value) === proxy) {
        use(expected);
      }
    });

    expect(await $.get(proxy)).toBe(expected);
  });
});
