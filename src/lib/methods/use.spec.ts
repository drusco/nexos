import { isTraceable } from "../../utils";
import Emulator from "../../Emulator";

const $ = new Emulator();

describe("(method) use", () => {
  it(`Always returns a proxy function`, () => {
    expect(typeof $.use({})).toBe("function");
    expect(typeof $.use([])).toBe("function");
    expect(typeof $.use(() => {})).toBe("function");
    expect(typeof $.use(async () => {})).toBe("function");
    expect(typeof $.use("string")).toBe("function");
    expect(typeof $.use(undefined)).toBe("function");
    expect(typeof $.use(true)).toBe("function");
    expect(typeof $.use(false)).toBe("function");
    expect(typeof $.use(null)).toBe("function");
    expect(typeof $.use(NaN)).toBe("function");
    expect(typeof $.use(Infinity)).toBe("function");
    expect(typeof $.use(100)).toBe("function");
    expect(typeof $.use(Symbol("sym"))).toBe("function");
    expect(typeof $.use(new Date())).toBe("function");
    expect(typeof $.use($)).toBe("function");
    expect(typeof $.use($.use())).toBe("function");
    expect(typeof $.use("abc").substring(1)).toBe("function");
  });

  it("Creates unique proxies when targets are not traceable", () => {
    const targets = [
      null,
      undefined,
      "string",
      $.use(),
      10,
      NaN,
      Infinity,
      true,
      false,
      Symbol(),
    ];
    const traceable = targets.some(isTraceable);

    const proxyA = $.use(targets[0]);
    const proxyB = $.use(targets[0]);

    expect(proxyA).not.toBe(proxyB);
    expect(traceable).toBe(false);
  });

  it("Can be referenced by an ObjectLike, ArrayLike or FunctionLike", () => {
    const ObjectLike = {};
    const ArrayLike = [];
    const FunctionLike = () => {};

    const ObjectLikeProxy = $.use(ObjectLike);
    const ArrayLikeProxy = $.use(ArrayLike);
    const FunctionLikeProxy = $.use(FunctionLike);

    expect(ObjectLikeProxy).toBe($.use(ObjectLike));
    expect(ArrayLikeProxy).toBe($.use(ArrayLike));
    expect(FunctionLikeProxy).toBe($.use(FunctionLike));
  });

  it("Returns a proxy function for undefined properties", () => {
    const proxy = $.use();
    expect(typeof proxy.undefined).toBe("function");
  });
});
