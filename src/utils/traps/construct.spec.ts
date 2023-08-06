import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(trap) construct", () => {
  it("Can construct an object and return its proxy", () => {
    class Test {
      property: number = 45;
      traceable: number[] = [55];
      inner: boolean;
      value: any;
      method(param: any) {
        this.inner = true;
        this.value = param;
      }
    }
    const TestClassProxy = $.use();
    const instance = new TestClassProxy(1, [2, 3], null);
    const value = instance.call();
    const test = $.use(new Test());
    const param = { param: true };

    test.method(param);
    instance.property = true;

    expect(typeof instance).toBe("function");
    expect(typeof value).toBe("function");
    expect(typeof test.unknown).toBe("function");
    expect($.target(instance.property)).toBe(true);
    expect($.target(test.property)).toBe(45);
    expect($.target(test.traceable[0])).toBe(55);
    expect($.target(test.inner)).toBe(true);
    expect(test.value).toBe($.use(param));
  });
});
