import isPayload from "./isPayload.js";

describe("(function) isPayload", () => {
  it("Returns true when the parameter is a valid proxy payload", () => {
    const payload = "⁠1";
    expect(isPayload(payload)).toBe(true);
  });
});
