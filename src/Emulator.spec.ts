import { describe, it, expect } from "@jest/globals";
import Emulator from "./Emulator";
import { isTraceable } from "./utils";

const $ = new Emulator();

describe("Emulator Class", () => {
  describe("(method) proxy", () => {
    it(`Always returns a proxy function`, () => {
      expect(typeof $.proxy({})).toBe("function");
      expect(typeof $.proxy([])).toBe("function");
      expect(typeof $.proxy(() => {})).toBe("function");
      expect(typeof $.proxy(async () => {})).toBe("function");
      expect(typeof $.proxy("string")).toBe("function");
      expect(typeof $.proxy(undefined)).toBe("function");
      expect(typeof $.proxy(true)).toBe("function");
      expect(typeof $.proxy(false)).toBe("function");
      expect(typeof $.proxy(null)).toBe("function");
      expect(typeof $.proxy(NaN)).toBe("function");
      expect(typeof $.proxy(Infinity)).toBe("function");
      expect(typeof $.proxy(100)).toBe("function");
      expect(typeof $.proxy(Symbol("sym"))).toBe("function");
      expect(typeof $.proxy(new Date())).toBe("function");
      expect(typeof $.proxy($)).toBe("function");
      expect(typeof $.proxy($.proxy())).toBe("function");
      expect(typeof $.proxy("abc").substring(1)).toBe("function");
    });

    it("Creates unique proxies when targets are not traceable", () => {
      const targets = [
        null,
        undefined,
        "string",
        $.proxy(),
        10,
        NaN,
        Infinity,
        true,
        false,
        Symbol(),
      ];
      const traceable = targets.some(isTraceable);

      const proxyA = $.proxy(targets[0]);
      const proxyB = $.proxy(targets[0]);

      expect(proxyA).not.toBe(proxyB);
      expect(traceable).toBe(false);
    });

    it("Can be referenced by an ObjectLike, ArrayLike or FunctionLike", () => {
      const ObjectLike = {};
      const ArrayLike = [];
      const FunctionLike = () => {};

      const ObjectLikeProxy = $.proxy(ObjectLike);
      const ArrayLikeProxy = $.proxy(ArrayLike);
      const FunctionLikeProxy = $.proxy(FunctionLike);

      expect(ObjectLikeProxy).toBe($.proxy(ObjectLike));
      expect(ArrayLikeProxy).toBe($.proxy(ArrayLike));
      expect(FunctionLikeProxy).toBe($.proxy(FunctionLike));
    });

    it("Returns a proxy function for undefined properties", () => {
      const proxy = $.proxy();
      expect(typeof proxy.undefined).toBe("function");
    });
  });

  describe("(method) target", () => {
    it("Returns the target used by a proxy", () => {
      const target = "$%&Test";
      const proxy = $.proxy(target);
      const targetFromProxy = $.target(proxy);
      expect(target).toBe(targetFromProxy);
    });

    it("Returns the target from an apply call on the original target", () => {
      const proxy = $.proxy("abc");
      const proxy2 = proxy.substring(1);

      expect($.target(proxy2)).toBe("bc");
    });

    it("Returns the target from inner properties", () => {
      const reference = [1, 2, 3, $.proxy(), {}];
      const proxy = $.proxy(reference);

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
      const parent = $.proxy();
      const child = parent.child;
      expect($.parent(child)).toBe(parent);
      expect($.parent(parent)).toBe(undefined);
    });
  });

  describe("(method) children", () => {
    it("Can access all the direct children of a proxy", () => {
      const parent = $.proxy();
      parent.girl = 10;
      parent.boy = 5;
      parent.alien = NaN;
      parent.alien.notDirectChild = true;

      expect($.children(parent).length).toBe(3);
    });

    it("Can use [Symbol.iterator] to access all children as well", () => {
      const parent = $.proxy();

      parent.girl = 1;
      parent.boy = 2;

      const children = [...parent];

      for (const proxy of parent) {
        expect($.parent(proxy)).toBe(parent);
      }

      expect(children.length).toBe(2);
    });
  });

  describe("(method) revoke", () => {
    it("Turns a proxy unusable", () => {
      const proxy = $.proxy();
      $.revoke(proxy);
      expect(proxy).toThrow();
      expect(() => proxy.property).toThrow();
      expect(() => (proxy.property = true)).toThrow();
      expect(() => delete proxy.property).toThrow();
      expect(() => new proxy().toThrow());
      expect(() => proxy.method()).toThrow();
    });
  });

  describe("(method) destroy", () => {
    it("Destroys the emulator and turns it unusable", () => {
      const $ = new Emulator();
      $.destroy();
      expect($.proxy).toThrow();
      expect($.bind).toThrow();
    });
  });

  describe("(method) count", () => {
    it("Returns the number of proxies in the emulator", () => {
      const current = $.count();
      $.proxy();
      expect($.count()).toBe(current + 1);
    });
  });

  describe("(method) encode", () => {
    it("Encodes a proxy synchronously", () => {
      const proxy = $.proxy();
      expect(typeof proxy).toBe("function");
      expect(typeof $.encode(proxy)).toBe("object");
    });

    it("Encodes multiple proxies deeply", () => {
      let times = 1000;
      const map: unknown[] = [];

      while (times) {
        map.push($.proxy());
        times -= 1;
      }

      const encoded: any = $.encode(map);
      expect(typeof encoded[999]).toBe("object");
    });
  });

  describe("(getter) keys", () => {
    it("Returns a list of all keys in use", () => {
      const ref = "refsTest";
      $.bind(ref);
      expect($.keys.includes(ref)).toBe(true);
    });
  });
});

describe("Proxy", () => {
  describe("Get, Set and Delete traps", () => {
    it("Can get values from a proxy", () => {
      const proxy = $.proxy();
      const deep = { test: true };

      proxy.number = 100;
      proxy.null = null;
      proxy.boolean = true;
      proxy.undefined = undefined;
      proxy.object = { test: true };
      proxy.array = ["test", $.proxy()];
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
      expect(proxy.object.sub.deep).toBe($.proxy(deep));
      expect($.target(proxy.object.sub.deep.test)).toBe(true);
      expect($.target(proxy.toDelete)).toBe(undefined);
    });

    it("Adds a value to the original target", () => {
      const proxy = $.proxy();
      const deep = { test: true, prox: true };

      proxy.set = { object: true };
      proxy.set.sub = {};
      proxy.set.sub.deep = deep;
      proxy.set.sub.deep.test = false;
      $.proxy(deep).test = null;
      $.proxy(deep).prox = $.proxy("test");

      expect(deep.test).toBe(null);
      expect($.target($.proxy(deep).test)).toBe(null);
      expect(deep.prox).toBe("test");
    });

    it("Can delete a property from a proxy and its original target", () => {
      const proxy = $.proxy({});
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
      const TestClassProxy = $.proxy();
      const instance = new TestClassProxy(1, [2, 3], null);
      const value = instance.call();
      const test = $.proxy(new Test());
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
      expect(test.value).toBe($.proxy(param));
    });

    it("Gets a proxy from an apply trap when target is not a function", () => {
      const proxy = $.proxy();
      expect(typeof proxy()).toBe("function");
    });

    it("Gets a value from an apply trap when target is a function", () => {
      const proxy = $.proxy((value: number) => value / 2);
      expect($.target(proxy(10))).toBe(5);
    });
  });
});
