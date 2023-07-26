import { describe, it, expect } from "@jest/globals";
import Emulator from "../dist";

const emulator = new Emulator();

describe("Emulator", () => {
  describe("Methods", () => {
    describe("use", () => {
      it(`Returns a proxy function`, () => {
        expect(typeof emulator.use({})).toBe("function");
        expect(typeof emulator.use([])).toBe("function");
        expect(typeof emulator.use(() => {})).toBe("function");
        expect(typeof emulator.use(async () => {})).toBe("function");
        expect(typeof emulator.use("string")).toBe("function");
        expect(typeof emulator.use(undefined)).toBe("function");
        expect(typeof emulator.use(true)).toBe("function");
        expect(typeof emulator.use(false)).toBe("function");
        expect(typeof emulator.use(null)).toBe("function");
        expect(typeof emulator.use(NaN)).toBe("function");
        expect(typeof emulator.use(Infinity)).toBe("function");
        expect(typeof emulator.use(100)).toBe("function");
        expect(typeof emulator.use(Symbol("sym"))).toBe("function");
        expect(typeof emulator.use(new Date())).toBe("function");
        expect(typeof emulator.use(emulator)).toBe("function");
        expect(typeof emulator.use(emulator.use())).toBe("function");
      });

      it("Can be referenced by an object", () => {
        const reference = { test: true };
        const proxy = emulator.use(reference);
        expect(proxy).toBe(emulator.use(reference));
        expect(proxy.test).toBe(true);
      });

      it("Returns a proxy function for undefined properties", () => {
        const reference = {};
        const proxy = emulator.use(reference);
        expect(typeof proxy.test).toBe("function");
      });

      it("Can be referenced by an array object", () => {
        const reference = [1, 2, 3, emulator.use(), {}];
        const arrayProxy = emulator.use(reference);

        arrayProxy.push("test");

        expect(arrayProxy[0]).toBe(1);
        expect(arrayProxy[1]).toBe(2);
        expect(arrayProxy[2]).toBe(3);
        expect(arrayProxy[3]).toBe(reference[3]);
        expect(arrayProxy[arrayProxy.length - 1]).toBe("test");
        expect(typeof arrayProxy[reference.length - 1]).toBe("function");

        expect(reference.length).toBe(5);
        expect(reference[reference.length]).toBe(undefined); // does not change the target

        expect(arrayProxy.length).toBe(reference.length + 1);
        expect(arrayProxy.pop()).toBe("test");
      });
    });

    describe("namespace", () => {
      it("Can be accessed through a string namespace", () => {
        const namespace = "test";
        const proxy = emulator.namespace(namespace);
        expect(proxy).toBe(emulator.namespace(namespace));
      });
    });

    describe("revoke", () => {
      it("Turns a proxy unusable", () => {
        const proxy = emulator.use();
        emulator.revoke(proxy);
        expect(proxy).toThrow();
        expect(() => proxy.property).toThrow();
        expect(() => (proxy.property = true)).toThrow();
        expect(() => delete proxy.property).toThrow();
        expect(() => new proxy().toThrow());
        expect(() => proxy.method()).toThrow();
      });
    });

    describe("destroy", () => {
      it("Destroys the emulator and turns it unusable", () => {
        const emulator = new Emulator();
        emulator.destroy();
        expect(emulator.use).toThrow();
        expect(emulator.namespace).toThrow();
      });
    });

    describe("count", () => {
      it("Returns the number of proxies in the emulator", () => {
        const current = emulator.count();
        emulator.use();
        expect(emulator.count()).toBe(current + 1);
      });
    });

    describe("groups", () => {
      it("Returns the number of namespaces in the emulator", () => {
        const current = emulator.groups();
        emulator.namespace(`${Date.now()}`);
        expect(emulator.groups()).toBe(current + 1);
      });
    });

    describe("encode", () => {
      it("Encodes a proxy synchronously", () => {
        const proxy = emulator.use();
        expect(typeof proxy).toBe("function");
        expect(typeof emulator.encode(proxy)).toBe("object");
      });

      it("Encodes multiple proxies deeply", () => {
        let times = 1000;
        const map: unknown[] = [];

        while (times) {
          map.push(emulator.use());
          times -= 1;
        }

        const encoded = emulator.encode(map);
        expect(typeof encoded[999]).toBe("object");
      });
    });
  });
});

describe("Proxy", () => {
  describe("Get, Set and Delete traps", () => {
    it("Can get values from a proxy", () => {
      const proxy = emulator.use();
      const deep = { test: true };

      proxy.number = 100;
      proxy.null = null;
      proxy.boolean = true;
      proxy.undefined = undefined;
      proxy.object = { test: true };
      proxy.array = ["test", emulator.use()];
      proxy.string = "test";
      proxy.function = () => "test";

      proxy.object.boolean = false;
      proxy.object.sub = {};
      proxy.object.sub.deep = deep;

      proxy.toDelete = true;
      delete proxy.toDelete;

      expect(typeof proxy.unknown).toBe("function");
      expect(proxy.number).toBe(100);
      expect(proxy.null).toBe(null);
      expect(proxy.boolean).toBe(true);
      expect(proxy.undefined).toBe(undefined);
      expect(typeof proxy.object).toBe("function");
      expect(typeof proxy.array).toBe("function");
      expect(proxy.string).toBe("test");
      expect(proxy.function()).toBe("test");
      expect(proxy.object.boolean).toBe(false);
      expect(typeof proxy.object.sub).toBe("function");
      expect(proxy.object.sub.deep).toBe(emulator.use(deep));
      expect(proxy.object.sub.deep.test).toBe(true);
      expect(proxy.toDelete).toBe(undefined);
    });

    it("Will not set a value to the original target", () => {
      const proxy = emulator.use();
      const deep = { test: true };

      proxy.set = { object: true };
      proxy.set.sub = {};
      proxy.set.sub.deep = deep;
      proxy.set.sub.deep.test = false;
      emulator.use(deep).test = null;

      expect(deep.test).toBe(true);
      expect(emulator.use(deep).test).toBe(null);
    });

    it("Can delete a property from a proxy and its original target", () => {
      const proxy = emulator.use();
      const deep = { deep: true, property: "test" };

      proxy.set = { test: true };
      proxy.set.sub = {};
      proxy.set.sub.deep = deep;

      delete proxy.set.sub.deep.property;
      delete proxy.set;

      expect(deep.property).toBe(undefined);
      expect(proxy.set).toBe(undefined);
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
      const TestClassProxy = emulator.use();
      const instance = new TestClassProxy(1, [2, 3], null);
      const value = instance.call();
      const test = emulator.use(new Test());
      const param = { param: true };

      test.method(param);
      instance.property = true;

      expect(typeof instance).toBe("function");
      expect(typeof value).toBe("function");
      expect(typeof test.unknown).toBe("function");
      expect(instance.property).toBe(true);
      expect(test.property).toBe(45);
      expect(test.traceable[0]).toBe(55);
      expect(test.inner).toBe(true);
      expect(test.value).toBe(emulator.use(param));
    });

    it("Gets a proxy from an apply trap when target is not a function", () => {
      const proxy = emulator.use();
      expect(typeof proxy()).toBe("function");
    });

    it("Gets a value from an apply trap when target is a function", () => {
      const proxy = emulator.use((value: number) => value / 2);
      expect(proxy(10)).toBe(5);
    });
  });
});
