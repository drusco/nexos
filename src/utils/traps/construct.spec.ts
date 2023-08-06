import Emulator from "../../Emulator";
const $ = new Emulator();

class Test {
  prop: number = 1;
  arr: number[] = [100];
  inner: boolean = false;
  value: any = null;
  method(value: any) {
    this.inner = true;
    this.value = value;
  }
}

describe("(trap) construct", () => {
  it("Creates an new instance and return its proxy", () => {
    const proxy = $.use();
    const instance = new proxy(1, [2, 3], null);
    const test = $.use(new Test());
    const param = {};

    test.method(param);

    expect(typeof instance).toBe("function");
    expect($.target(test.prop)).toBe(1);
    expect($.target(test.arr[0])).toBe(100);
    expect($.target(test.inner)).toBe(true);
    expect(test.value).toBe($.use(param));
  });
});
