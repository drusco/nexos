import Nexo from "../lib/ProxyNexo.js";
import { isProxyPayload } from "./index.js";
import map from "../lib/maps.js";
import { NO_BREAK } from "../lib/constants.js";

const nexo = new Nexo();

describe("isProxyPayload", () => {
  it("Returns true when the parameter is a proxy payload", () => {
    const proxy = nexo.create();
    const { id } = map.proxies.get(proxy);
    const result = isProxyPayload(NO_BREAK + id);

    expect(result).toBe(true);
  });
});
