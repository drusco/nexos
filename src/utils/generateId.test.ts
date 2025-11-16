import generateId from "./generateId.js";

describe("generateId", () => {
  it("creates a unique string id", () => {
    const foo = generateId();
    const bar = generateId();

    expect(typeof foo).toBe("string");
    expect(typeof bar).toBe("string");
    expect(foo).not.toBe(bar);
  });
});
