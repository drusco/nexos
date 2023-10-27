import constants from "./constants.js";
import isProxyPayload from "./isProxyPayload.js";

describe("(function) isProxyPayload", () => {
  it("Returns true when the parameter is a valid proxy payload", () => {
    const payload = `${constants.NO_BREAK}1`;
    const notPayload = "1";
    expect(isProxyPayload(payload)).toBe(true);
    expect(isProxyPayload(notPayload)).toBe(false);
  });
});
