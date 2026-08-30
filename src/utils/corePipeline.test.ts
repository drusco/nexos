import corePipeline from "./corePipeline.js";

describe("corePipeline", () => {
  it("protects the lock guard from removal", () => {
    expect(() => corePipeline.remove("lock")).toThrow(
      "Cannot remove a protected middleware.",
    );
  });

  it("protects the lock guard from being preceded", () => {
    expect(() => corePipeline.prepend((_, next) => next())).toThrow(
      "Cannot prepend before a protected middleware.",
    );
  });

  it("protects the lock guard from insertion before it", () => {
    expect(() =>
      corePipeline.insertBefore("lock", (_, next) => next()),
    ).toThrow("Cannot insert before a protected middleware.");
  });

  it("protects the lock guard from re-parenting", () => {
    expect(() => corePipeline.setParent()).toThrow(
      "Cannot re-parent a pipeline that contains protected middlewares.",
    );
  });
});
