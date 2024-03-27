import ProxyNexo from "../lib/Nexo.js";
import { getProxyPayload } from "./index.js";
import map from "../lib/maps.js";
import { PAYLOAD_PREFIX, IS_PAYLOAD } from "../lib/constants.js";

const nexo = new ProxyNexo();

describe("getProxyPayload", () => {
  it("Returns an encoded proxy id", () => {
    const proxy = nexo.proxy();
    const encodedId = getProxyPayload(proxy);
    const { id } = map.proxies.get(proxy);
    const proxyPayload = PAYLOAD_PREFIX + id;

    expect(encodedId).toBe(proxyPayload);
    expect(IS_PAYLOAD.test(encodedId)).toBe(true);
  });
});
