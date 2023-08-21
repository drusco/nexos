import Emulator from "../../Emulator";
import Exotic from "../../types/Exotic";

describe("(method) get", () => {
  it("Gets the external value of a single proxy", async () => {
    const $ = new Emulator();
    const proxy = $.use(2200);

    $.on("get", (values: any[], use: Exotic.FunctionLike) => {
      use($.decode(values).map((arg: any) => $.target(arg)));
    });

    const [value] = await $.get(proxy);

    expect(value).toBe(2200);
  });

  it("Gets the external value of multiple proxies at once", async () => {
    const $ = new Emulator();
    const proxy = $.use(100);
    const proxy2 = $.use(200);

    $.on("get", (values: any[], use: Exotic.FunctionLike) => {
      use($.decode(values).map((arg: any) => $.target(arg)));
    });

    const [first, second] = await $.get(proxy, proxy2);

    expect(first).toBe(100);
    expect(second).toBe(200);
  });
});
