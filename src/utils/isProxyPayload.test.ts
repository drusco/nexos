import ProxyNexo from "../lib/Nexo.js";
import map from "../lib/maps.js";
import isProxyPayload from "./isProxyPayload.js";
import { PAYLOAD_PREFIX } from "../lib/constants.js";

const nexo = new ProxyNexo();

describe("isProxyPayload", () => {
  it("Returns true when the parameter is an UUID payload", () => {
    const proxy = nexo.proxy();
    const { id } = map.proxies.get(proxy);
    const result = isProxyPayload(PAYLOAD_PREFIX + id);

    expect(result).toBe(true);
  });
});
