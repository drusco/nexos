import getSandbox from "./getSandbox.js";

describe("getSandbox", () => {
  it("creates a function with null prototype", () => {
    const sandbox = getSandbox();

    expect(typeof sandbox).toBe("function");
    expect(Object.getPrototypeOf(sandbox)).toBe(null);
  });

  it("creates unique values on each call", () => {
    const foo = getSandbox();
    const bar = getSandbox();

    expect(foo).not.toBe(bar);
  });
});
