import ProxyNexo from "../lib/Nexo.js";
import { getTarget } from "./index.js";

const nexo = new ProxyNexo();

describe("getTarget", () => {
  it("Returns the same value when the value is not a proxy", () => {
    const notAProxy = {};
    const result = getTarget(notAProxy);

    expect(result).toBe(notAProxy);
  });

  it("Returns the target of a proxy", () => {
    const target = [];
    const proxy = nexo.proxy();
    const proxyWithTarget = nexo.proxy(target);

    const result = getTarget(proxy);
    const resultWithTarget = getTarget(proxyWithTarget);

    expect(result).toBeUndefined();
    expect(resultWithTarget).toBe(target);
  });

  it("Returns the proxy when the second parameter is true", () => {
    const target = [];
    const proxy = nexo.proxy();
    const proxyWithTarget = nexo.proxy(target);

    const result = getTarget(proxy, true);
    const resultWithTarget = getTarget(proxyWithTarget, true);
    const resultFromTarget = getTarget(target, true);

    expect(result).toBe(proxy);
    expect(resultWithTarget).toBe(proxyWithTarget);
    expect(resultFromTarget).toBe(proxyWithTarget);
  });

  it("Returns the target from a WeakRef(proxy)", () => {
    const target = [];
    const proxy = nexo.proxy(target);
    const wref = new WeakRef(proxy);

    const targetResult = getTarget(wref);
    const proxyResult = getTarget(wref, true);

    expect(targetResult).toBe(target);
    expect(proxyResult).toBe(proxy);
  });

  it("Returns the target from a WeakRef(object)", () => {
    const target = [];
    const proxy = nexo.proxy(target);
    const wref = new WeakRef(proxy);
    const deepRef = new WeakRef(wref);

    const wrefResult = getTarget(deepRef);
    const wrefResult2 = getTarget(deepRef, true);

    expect(wrefResult).toBe(wref);
    expect(wrefResult2).toBe(wref);
  });
});
