import { describe, it, expect } from "@jest/globals";
import Emulator from "./Emulator";

const emulator = new Emulator();
const emulator2 = new Emulator();

describe("Emulator", () => {
  describe("methods", () => {
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

        expect(arrayProxy.length).toStrictEqual(reference.length + 1);
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
      it("Destroys the emulator and turn it unusable", () => {
        emulator2.destroy();
        let error: any;
        try {
          emulator2.use();
        } catch (e) {
          error = e;
        }
        expect(error instanceof Error).toStrictEqual(true);
      });
    });

    describe("count", () => {
      it("Returns total proxies in map", () => {
        const current = emulator.count();
        const expected = current + 3;

        emulator.use();
        emulator.use("b");
        emulator.use("c");

        expect(emulator.count()).toStrictEqual(expected);
      });
    });

    describe("groups", () => {
      it("Returns total namespaces in map", () => {
        const current = emulator.groups();
        const expected = current + 1;

        emulator.use();
        emulator.namespace("ns-c-2");

        expect(emulator.groups()).toStrictEqual(expected);
      });
    });

    describe("equal", () => {
      it("Compares proxies and targets", () => {
        const original1 = { unique: true };
        const original2 = { external: true };

        const a = emulator.use();
        const b = emulator.use(original1);
        const c = emulator.use(original2);

        expect(Emulator.equal(original1, b)).toStrictEqual(true);
        expect(Emulator.equal(b, original1)).toStrictEqual(true);
        expect(Emulator.equal(original1, original2)).toStrictEqual(false);
        expect(Emulator.equal(a, b)).toStrictEqual(false);
        expect(Emulator.equal(a, c)).toStrictEqual(false);
        expect(Emulator.equal(b, c)).toStrictEqual(false);
      });
    });

    describe("encode", () => {
      it("Encodes a proxy synchronously", () => {
        const proxy = emulator.use();

        expect(typeof proxy).toStrictEqual("function");
        expect(typeof emulator.encode(proxy)).toStrictEqual("object");
      });

      it("Encodes multiple proxies", () => {
        let times = 1000;
        const obj = {};

        while (times) {
          obj[times] = emulator.use();
          times--;
        }

        expect(typeof obj[1]).toStrictEqual("function");

        const encoded = emulator.encode(obj);

        expect(typeof encoded[1]).toStrictEqual("object");
      });
    });
  });

  describe("proxy", () => {
    describe("get, set, deleteProperty", () => {
      it("Can set and get values on a proxy", () => {
        const a = emulator.use();
        a.set = null;
        a.set1 = undefined;
        a.set2 = { object: true };
        a.set3 = "string";
        a.set4 = () => {
          console.log("function call");
        };
        a.set5 = [1, 2, 3];
        a.set6 = true;
        a.set7 = 12.2;
        a.set8 = 45;
        a.set9 = new Date();
        const deep = { deep: true };
        a.set2.sub = false;
        a.set2.sub2 = {};
        a.set2.sub2.deep = deep;
        expect(typeof a.treatAsProxy).toBe("function");
        expect(a.set).toStrictEqual(null);
        expect(a.set1).toStrictEqual(undefined);
        expect(a.set3).toStrictEqual("string");
        expect(a.set6).toStrictEqual(true);
        expect(a.set7).toStrictEqual(12.2);
        expect(a.set8).toStrictEqual(45);
        expect(a.set2.sub).toStrictEqual(false);
        expect(Emulator.equal(deep, a.set2.sub2.deep)).toStrictEqual(true);
      });

      it("Will not set a value to the original target", () => {
        const a = emulator.use();
        const deep = { deep: true, property: undefined };
        a.set2 = { object: true };
        a.set2.sub = false;
        a.set2.sub2 = {};
        a.set2.sub2.deep = deep;
        a.set2.sub2.deep.property = "hello world";
        expect(deep.property).toEqual(undefined);
        expect(a.set2.sub2.deep).not.toBe(deep);
        expect(Emulator.equal(a.set2.sub2.deep, deep)).toStrictEqual(true);
        const deep2 = emulator.use(a.set2.sub2.deep);
        // proxy out of proxy is not allowed
        expect(deep2).toStrictEqual(a.set2.sub2.deep);
        const abc = emulator.use({ property: true });
        a.set2.sub2.deep.setProxy = abc;
        expect(abc.property).toStrictEqual(a.set2.sub2.deep.setProxy.property);
      });

      it("Can delete a property from a proxy and its original target", () => {
        const a = emulator.use();
        const deep = { deep: true, property: undefined };
        a.set2 = { object: true };
        a.set2.sub = false;
        a.set2.sub2 = {};
        a.set2.sub2.deep = deep;
        delete a.set2.sub2.deep.property;
        expect(deep.property).toStrictEqual(undefined);
        delete a.set2;
        expect(a.set2).toStrictEqual(undefined);
      });
    });

    describe("construct, apply", () => {
      it("can construct an object and return its proxy", () => {
        function MyClass() {
          this.property = 45;
          this.traceable = [55];
          this.method = function (param) {
            this.inner = true;
            this.value = param;
          };
        }
        const Class = emulator.use({});
        const instance = new Class(1, [2, 3], null);
        instance.property = true;
        const value = instance.call();
        expect(instance.property).toStrictEqual(true);
        expect(typeof value).toBe("function");
        const res = emulator.use(new MyClass());
        expect(res.property).toStrictEqual(45);
        expect(res.traceable[0]).toStrictEqual(55);
        expect(typeof res.unknown).toBe("function");
        const param = { param: true };
        res.method(param);
        expect(res.inner).toStrictEqual(true);
        expect(Emulator.equal(res.value, param)).toStrictEqual(true);
      });

      it("always get a proxy from an apply trap", () => {
        const call = emulator.use();
        expect(typeof call()).toBe("function");
      });
    });
  });
});
