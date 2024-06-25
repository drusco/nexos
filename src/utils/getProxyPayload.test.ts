import ProxyNexo from "../Nexo.js";
import getProxyPayload from "./getProxyPayload.js";
import map from "./maps.js";
import { PAYLOAD_PREFIX, IS_PAYLOAD } from "./constants.js";

const nexo = new ProxyNexo();

describe("getProxyPayload", () => {
  it("Returns an encoded proxy id", () => {
    const proxy = nexo.create();
    const encodedId = getProxyPayload(proxy);
    const { id } = map.proxies.get(proxy);
    const proxyPayload = PAYLOAD_PREFIX + id;

    expect(encodedId).toBe(proxyPayload);
    expect(IS_PAYLOAD.test(encodedId)).toBe(true);
  });
});
