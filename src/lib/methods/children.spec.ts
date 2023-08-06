import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(method) children", () => {
  it("Can access all the direct children of a proxy", () => {
    const parent = $.use();
    parent.daugter = 25;
    parent.son = 30;
    parent.son.parentGrandson = 2;

    expect($.children(parent).length).toBe(2);
  });

  it("Can use [Symbol.iterator] to access all children as well", () => {
    const parent = $.use();

    parent.daughter = 25;
    parent.son = 30;

    const children = [...parent];
    const targetList = children.map((child) => $.target(child));

    for (const proxy of parent) {
      expect($.parent(proxy)).toBe(parent);
    }

    expect(children.length).toBe(2);
    expect(targetList.includes(25)).toBe(true);
    expect(targetList.includes(30)).toBe(true);
  });
});
