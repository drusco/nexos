import { describe, it, expect } from "@jest/globals";
import Emulator from "./Emulator";
import { isTraceable } from "./utils";

const $ = new Emulator();

describe("Emulator Class", () => {
  describe("(method) proxy", () => {
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

  describe("(method) target", () => {
    it("Returns the target used by a proxy", () => {
      const target = "$%&Test";
      const proxy = $.use(target);
      const targetFromProxy = $.target(proxy);
      expect(target).toBe(targetFromProxy);
    });

    it("Returns the target from an apply call on the original target", () => {
      const proxy = $.use("abc");
      const proxy2 = proxy.substring(1);

      expect($.target(proxy2)).toBe("bc");
    });

    it("Returns the target from inner properties", () => {
      const reference = [1, 2, 3, $.use(), {}];
      const proxy = $.use(reference);

      proxy.push("test");

      expect($.target(proxy[0])).toBe(1);
      expect($.target(proxy[1])).toBe(2);
      expect($.target(proxy[2])).toBe(3);
      expect(proxy[3]).toBe(reference[3]);
      expect($.target(proxy[$.target(proxy.length) - 1])).toBe("test");
      expect(typeof proxy[reference.length - 1]).toBe("function");

      expect(reference.length).toBe(6);
      expect($.target(proxy.length)).toBe(reference.length);
      expect($.target(proxy.pop())).toBe("test");
      expect(reference.length).toBe(5);
      expect($.target(proxy.length)).toBe(reference.length);
    });
  });

  describe("(method) bind", () => {
    it("Can access a proxy using a string", () => {
      const key = "test";
      const proxy = $.bind(key);
      expect(proxy).toBe($.bind(key));
    });

    it("Can access a proxy using a symbol", () => {
      const key = Symbol();
      const proxy = $.bind(key);
      expect(proxy).toBe($.bind(key));
    });
  });

  describe("(method) parent", () => {
    it("Access a proxy parent", () => {
      const parent = $.use();
      const child = parent.child;
      expect($.parent(child)).toBe(parent);
      expect($.parent(parent)).toBe(undefined);
    });
  });

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

  describe("(method) ownKeys", () => {
    it("Returns an Array of the proxy's own property keys, including strings and symbols", () => {
      const proxy = $.use();
      const symbol = Symbol();

      proxy.a = true;
      proxy.b = true;
      proxy[symbol] = true;

      const keys = $.ownKeys(proxy);

      expect(keys.length).toBe(3);
      expect(keys.includes("a")).toBe(true);
      expect(keys.includes("b")).toBe(true);
      expect(keys.includes(symbol)).toBe(true);
    });
  });

  describe("(method) revoke", () => {
    it("Revokes a single proxy", () => {
      const proxy = $.use();
      const inner = proxy.inner;

      $.revoke(proxy);

      expect(proxy).toThrow();
      expect(inner).not.toThrow();
      expect(() => proxy.inner).toThrow();
      expect(() => (proxy.inner = true)).toThrow();
      expect(() => delete proxy.inner).toThrow();
      expect(() => new proxy()).toThrow();
      expect(() => proxy.inner()).toThrow();
      expect($.use(proxy)).not.toBe(proxy);
      expect($.use(inner)).toBe(inner);
    });

    it("Revokes and removes internal references", () => {
      const proxy = $.use();
      const inner = proxy.inner;

      $.revoke(inner);

      expect(proxy).not.toThrow();
      expect(inner).toThrow();
      expect(() => new inner()).toThrow();
      expect(() => inner()).toThrow();
      expect($.use(proxy)).toBe(proxy);
      expect($.use(inner)).not.toBe(inner);
      expect($.ownKeys(proxy).includes("inner")).toBe(false);
    });
  });

  describe("(method) revokeAll", () => {
    it("Revokes a proxy and all of its child proxies", () => {
      const proxy = $.use();

      proxy.aaa;

      // const inner = (proxy.inner = true);
      // const child = (proxy.child = true);
      // const property = (proxy.property = true);
      // const propertyInner = (proxy.property.inner = true);

      for (const [key, prox] of $.entries()) {
        console.log(key, prox);
      }

      // $.revokeAll(proxy);

      // expect(proxy).toThrow();
      // expect(inner).toThrow();
      // expect(child).toThrow();
      // expect(property).toThrow();
      // expect(propertyInner).toThrow();
    });
  });

  describe("(method) encode", () => {
    // TODO
  });

  describe("(getter) refs", () => {
    it("Returns an Array of all binding keys in use", () => {
      const key = "test";
      $.bind(key);
      expect($.refs.includes(key)).toBe(true);
    });
  });

  describe("(getter) length", () => {
    it("Returns the number of built proxies", () => {
      const total = $.length;
      $.use();
      expect($.length).toBe(total + 1);
    });
  });

  describe("(getter) void", () => {
    it("Returns the number of revoked proxies", () => {
      const revoked = $.void;
      $.revoke($.use());
      expect($.void).toBe(revoked + 1);
    });
  });

  describe("(getter) active", () => {
    it("Returns the number of active proxies", () => {
      const active = $.active;
      $.use();
      expect($.active).toBe(active + 1);
    });
  });
});

describe("Proxy", () => {
  describe("Get, Set and Delete traps", () => {
    it("Can get values from a proxy", () => {
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
      expect($.target(proxy.undefined)).toBe(undefined);
      expect(typeof proxy.object).toBe("function");
      expect(typeof proxy.array).toBe("function");
      expect($.target(proxy.string)).toBe("test");
      expect($.target(proxy.function())).toBe("test");
      expect($.target(proxy.object.boolean)).toBe(false);
      expect(typeof proxy.object.sub).toBe("function");
      expect(proxy.object.sub.deep).toBe($.use(deep));
      expect($.target(proxy.object.sub.deep.test)).toBe(true);
      expect($.target(proxy.toDelete)).toBe(undefined);
    });

    it("Adds a value to the original target", () => {
      const proxy = $.use();
      const deep = { test: true, prox: true };

      proxy.set = { object: true };
      proxy.set.sub = {};
      proxy.set.sub.deep = deep;
      proxy.set.sub.deep.test = false;
      $.use(deep).test = null;
      $.use(deep).prox = $.use("test");

      expect(deep.test).toBe(null);
      expect($.target($.use(deep).test)).toBe(null);
      expect(deep.prox).toBe("test");
    });

    it("Can delete a property from a proxy and its original target", () => {
      const proxy = $.use({});
      const deep = { deep: true, property: "test" };

      proxy.set = { test: true };
      proxy.set.sub = {};
      proxy.set.sub.deep = deep;

      delete proxy.set.sub.deep.property;
      delete proxy.set;

      expect(deep.property).toBe(undefined);
      expect($.target(proxy.set)).toBe(undefined);
    });
  });

  describe("Construct and Apply traps", () => {
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

    it("Gets a proxy from an apply trap when target is not a function", () => {
      const proxy = $.use();
      expect(typeof proxy()).toBe("function");
    });

    it("Gets a value from an apply trap when target is a function", () => {
      const proxy = $.use((value: number) => value / 2);
      expect($.target(proxy(10))).toBe(5);
    });
  });
});
