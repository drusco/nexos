import Nexo from "../Nexo.js";
import { getTarget } from "./index.js";

const nexo = new Nexo();

describe("getTarget", () => {
  it("Returns the same value when the value is not a proxy", () => {
    const notAProxy = {};
    const result = getTarget(notAProxy);

    expect(result).toStrictEqual(notAProxy);
  });

  it("Returns the target of a proxy", () => {
    const target = [];
    const proxy = nexo.create();
    const proxyWithTarget = nexo.create(target);

    const result = getTarget(proxy);
    const resultWithTarget = getTarget(proxyWithTarget);

    expect(result).toBeUndefined();
    expect(resultWithTarget).toStrictEqual(target);
  });

  it("Returns the proxy when the second parameter is true", () => {
    const target = [];
    const proxy = nexo.create();
    const proxyWithTarget = nexo.create(target);

    const result = getTarget(proxy, true);
    const resultWithTarget = getTarget(proxyWithTarget, true);
    const resultFromTarget = getTarget(target, true);

    expect(result).toStrictEqual(proxy);
    expect(resultWithTarget).toStrictEqual(proxyWithTarget);
    expect(resultFromTarget).toStrictEqual(proxyWithTarget);
  });

  it("Returns the target from a WeakRef(proxy)", () => {
    const target = [];
    const proxy = nexo.create(target);
    const wref = new WeakRef(proxy);

    const targetResult = getTarget(wref);
    const proxyResult = getTarget(wref, true);

    expect(targetResult).toStrictEqual(target);
    expect(proxyResult).toStrictEqual(proxy);
  });

  it("Returns the target from a WeakRef(object)", () => {
    const target = [];
    const proxy = nexo.create(target);
    const wref = new WeakRef(proxy);
    const deepRef = new WeakRef(wref);

    const wrefResult = getTarget(deepRef);
    const wrefResult2 = getTarget(deepRef, true);

    expect(wrefResult).toStrictEqual(wref);
    expect(wrefResult2).toStrictEqual(wref);
  });
});
