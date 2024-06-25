import ProxyNexo from "../Nexo.js";
import cloneModify from "./cloneModify.js";
import isProxy from "./isProxy.js";

const nexo = new ProxyNexo();

describe("cloneModify", () => {
  it("Creates a shallow copy for plain objects or arrays", () => {
    const data = {
      foo: "file",
      bar: [10, 20],
      test: true,
    };

    const result = cloneModify(data);

    expect(result).not.toBe(data);
    expect(result.foo).toBe("file");
    expect(result.bar).toStrictEqual([10, 20]);
    expect(result.bar).not.toBe(data.bar);
    expect(result.test).toBe(true);
  });

  it("Returns the same value if it is not an array or a plain object", () => {
    const symbol = Symbol();
    const map = new Map();
    const date = new Date();

    expect(cloneModify(true)).toBe(true);
    expect(cloneModify(false)).toBe(false);
    expect(cloneModify(NaN)).toBe(NaN);
    expect(cloneModify(Infinity)).toBe(Infinity);
    expect(cloneModify("foo")).toBe("foo");
    expect(cloneModify(symbol)).toBe(symbol);
    expect(cloneModify(null)).toBe(null);
    expect(cloneModify(undefined)).toBe(undefined);
    expect(cloneModify(100)).toBe(100);
    expect(cloneModify(10.5)).toBe(10.5);
    expect(cloneModify(map)).toBe(map);
    expect(cloneModify(date)).toBe(date);
    expect(cloneModify(nexo)).toBe(nexo);
  });

  it("Handles circular references by using an internal cache", () => {
    const foo = { bar: null };
    const bar = [foo];

    foo.bar = bar;

    const result = cloneModify(bar);

    expect(result).not.toBe(bar);
    expect(result[0]).not.toBe(foo);
    expect(result[0]).toStrictEqual(foo);
    expect(result[0].bar).toBe(result);
    expect(result[0]).toBe(result[0].bar[0]);
  });

  it("Can transform the value when it is neither array nor plain object", () => {
    const proxy = nexo.create();

    const data = {
      proxy,
      map: new Map(),
      bar: () => {},
    };

    const transform = (value: unknown) => {
      if (isProxy(value)) {
        return "foo";
      }

      if (typeof value === "function") {
        return null;
      }

      return "bar";
    };

    const result = cloneModify(data, true, transform);

    expect(result.proxy).toBe("foo");
    expect(result.map).toBe("bar");
    expect(result.bar).toBe(null);
  });

  it("Prevents objects an arrays to be cloned deeply; i.e., creates shallow copies", () => {
    const foo = { bar: [[], () => {}, {}] };

    const result = cloneModify(foo, false);

    expect(foo).not.toBe(result);
    expect(foo.bar).toBe(result.bar);
  });
});
