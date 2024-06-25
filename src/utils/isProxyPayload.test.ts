import ProxyNexo from "../Nexo.js";
import map from "./maps.js";
import isProxyPayload from "./isProxyPayload.js";
import { PAYLOAD_PREFIX } from "./constants.js";

const nexo = new ProxyNexo();

describe("isProxyPayload", () => {
  it("Returns true when the parameter is an UUID payload", () => {
    const proxy = nexo.create();
    const { id } = map.proxies.get(proxy);
    const result = isProxyPayload(PAYLOAD_PREFIX + id);

    expect(result).toBe(true);
  });
});
