import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(trap) get", () => {
  it("Returns a new or existing proxy for the target's property", () => {
    const proxy = $.use();
    const deep = { test: true };

    proxy.number = 100;
    proxy.null = null;
    proxy.boolean = true;
    proxy.undefined = undefined;
    proxy.object = { test: true };
    proxy.array = ["test", $.use()];
    proxy.string = "test";
    proxy.function = () => "test";

    proxy.object.boolean = false;
    proxy.object.sub = {};
    proxy.object.sub.deep = deep;

    proxy.toDelete = true;
    delete proxy.toDelete;

    expect(typeof proxy.unknown).toBe("function");
    expect($.target(proxy.number)).toBe(100);
    expect($.target(proxy.null)).toBe(null);
    expect($.target(proxy.boolean)).toBe(true);
    expect($.target(proxy.undefined)).toBeUndefined();
    expect(typeof proxy.object).toBe("function");
    expect(typeof proxy.array).toBe("function");
    expect($.target(proxy.string)).toBe("test");
    expect($.target(proxy.function())).toBe("test");
    expect($.target(proxy.object.boolean)).toBe(false);
    expect(typeof proxy.object.sub).toBe("function");
    expect(proxy.object.sub.deep).toBe($.use(deep));
    expect($.target(proxy.object.sub.deep.test)).toBe(true);
    expect($.target(proxy.toDelete)).toBeUndefined();
  });
});
