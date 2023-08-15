import Exotic from "../types/Exotic";
import isPayload from "./isPayload";

describe("(function) isPayload", () => {
  it("Returns true when the parameter is a valid proxy payload", () => {
    const payload: Exotic.proxy.payload = ["⁠", 1];
    expect(isPayload(payload)).toBe(true);
  });
});
