import createDeferred from "./createDeferred.js";

describe("createDeferred", () => {
  it("should return a promise with resolve and reject methods", () => {
    const deferred = createDeferred();

    expect(deferred).toHaveProperty("promise");
    expect(deferred.promise).toBeInstanceOf(Promise);
    expect(typeof deferred.resolve).toBe("function");
    expect(typeof deferred.reject).toBe("function");
  });

  it("should resolve the promise with a given value", async () => {
    const deferred = createDeferred<boolean>();

    deferred.resolve(true);

    await expect(deferred.promise).resolves.toBe(true);
  });

  it("should reject the promise with an error", async () => {
    const deferred = createDeferred();

    const error = new Error("expected failure");
    deferred.reject(error);

    await expect(deferred.promise).rejects.toThrow("expected failure");
  });
});
