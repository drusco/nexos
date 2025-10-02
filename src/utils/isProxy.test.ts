import isProxy from "./isProxy.js";
import getProxy from "./getProxy.js";

describe("isProxy", () => {
  it("Returns true when the parameter is a proxy", () => {
    const proxy = getProxy();
    const result = isProxy(proxy);

    expect(result).toBe(true);
  });

  it("Returns false when the parameter is not a proxy", () => {
    expect(isProxy(undefined)).toBe(false);
    expect(isProxy(NaN)).toBe(false);
    expect(isProxy(null)).toBe(false);
    expect(isProxy("foo")).toBe(false);
    expect(isProxy(() => {})).toBe(false);
    expect(isProxy({})).toBe(false);
    expect(isProxy([])).toBe(false);
    expect(isProxy(true)).toBe(false);
  });
});
