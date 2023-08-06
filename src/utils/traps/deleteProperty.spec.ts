import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(trap) deleteProperty", () => {
  it("Can delete a property from a proxy and its original target", () => {
    const proxy = $.use({});
    const deep = { deep: true, property: "test" };

    proxy.set = { test: true };
    proxy.set.sub = {};
    proxy.set.sub.deep = deep;

    delete proxy.set.sub.deep.property;
    delete proxy.set;

    expect(deep.property).toBeUndefined();
    expect($.target(proxy.set)).toBeUndefined();
  });
});
