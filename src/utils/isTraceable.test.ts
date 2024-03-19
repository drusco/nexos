import { isTraceable } from "./index.js";

describe("isTraceable", () => {
  it("Returns true when the value is a non null object or a function", () => {
    const traceableObject = isTraceable({});
    const traceableArray = isTraceable([]);
    const traceableFunction = isTraceable(() => {});

    expect(traceableArray).toBe(true);
    expect(traceableObject).toBe(true);
    expect(traceableFunction).toBe(true);
  });

  it("Returns false when the parameter is not traceable", () => {
    expect(isTraceable(undefined)).toBe(false);
    expect(isTraceable(NaN)).toBe(false);
    expect(isTraceable(null)).toBe(false);
    expect(isTraceable("foo")).toBe(false);
    expect(isTraceable(1000)).toBe(false);
    expect(isTraceable(true)).toBe(false);
  });
});
