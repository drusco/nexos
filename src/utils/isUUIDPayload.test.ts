import ProxyNexo from "../lib/Nexo.js";
import map from "../lib/maps.js";
import { isUUIDPayload } from "./index.js";
import { PAYLOAD_PREFIX } from "../lib/constants.js";

const nexo = new ProxyNexo();

describe("isUUIDPayload", () => {
  it("Returns true when the parameter is an UUID payload", () => {
    const proxy = nexo.proxy();
    const { id } = map.proxies.get(proxy);
    const result = isUUIDPayload(PAYLOAD_PREFIX + id);

    expect(result).toBe(true);
  });
});
