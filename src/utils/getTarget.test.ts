import ProxyNexo from "../Nexo.js";
import getTarget from "./getTarget.js";

const nexo = new ProxyNexo();

describe("getTarget", () => {
  it("Returns the same value when the value is not a proxy", () => {
    const notAProxy = {};
    const result = getTarget(notAProxy);

    expect(result).toBe(notAProxy);
  });

  it("Returns the target of a proxy", () => {
    const target = [];
    const proxy = nexo.create();
    const proxyWithTarget = nexo.create(target);

    const result = getTarget(proxy);
    const resultWithTarget = getTarget(proxyWithTarget);

    expect(result).toBeUndefined();
    expect(resultWithTarget).toBe(target);
  });

  it("Returns the proxy when the second parameter is true", () => {
    const target = [];
    const proxy = nexo.create();
    const proxyWithTarget = nexo.create(target);

    const result = getTarget(proxy, true);
    const resultWithTarget = getTarget(proxyWithTarget, true);
    const resultFromTarget = getTarget(target, true);

    expect(result).toBe(proxy);
    expect(resultWithTarget).toBe(proxyWithTarget);
    expect(resultFromTarget).toBe(proxyWithTarget);
  });
});
