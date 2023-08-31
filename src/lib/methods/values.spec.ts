import Emulator from "../../Emulator.js";
const $ = new Emulator();

describe("(method) values", () => {
  it("Can access all the direct values of a proxy", () => {
    const parent = $.use();
    parent.daugter = 25;
    parent.son = 30;
    parent.son.parentGrandson = 2;

    expect($.values(parent).length).toBe(2);
  });

  it("Can use [Symbol.iterator] to access all values as well", () => {
    const parent = $.use();

    parent.daughter = 25;
    parent.son = 30;

    const values = [...parent];
    const targetList = values.map((child) => $.target(child));

    for (const proxy of parent) {
      expect($.parent(proxy)).toBe(parent);
    }

    expect(values.length).toBe(2);
    expect(targetList.includes(25)).toBe(true);
    expect(targetList.includes(30)).toBe(true);
  });
});
