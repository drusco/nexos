import Nexo from "../Nexo.js";
import { constants, getProxyPayload, map } from "./index.js";

const nexo = new Nexo();

describe("getProxyPayload", () => {
  it("Returns an encoded proxy id", () => {
    const proxy = nexo.create();
    const encodedId = getProxyPayload(proxy);
    const { id } = map.proxies.get(proxy);
    const proxyPayload = constants.NO_BREAK + id;

    expect(encodedId).toBe(proxyPayload);
    expect(constants.IS_PROXY_ID_REGEXP.test(encodedId)).toBe(true);
  });
});
