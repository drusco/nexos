import Nexo from "../lib/Nexo.js";
import { getProxyPayload } from "./index.js";
import map from "../lib/maps.js";
import { NO_BREAK, IS_PROXY_ID_REGEXP } from "../lib/constants.js";

const nexo = new Nexo();

describe("getProxyPayload", () => {
  it("Returns an encoded proxy id", () => {
    const proxy = nexo.create();
    const encodedId = getProxyPayload(proxy);
    const { id } = map.proxies.get(proxy);
    const proxyPayload = NO_BREAK + id;

    expect(encodedId).toBe(proxyPayload);
    expect(IS_PROXY_ID_REGEXP.test(encodedId)).toBe(true);
  });
});
