import Nexo from "../lib/NexoProxy.js";
import map from "../lib/maps.js";
import { isUUIDPayload } from "./index.js";
import { PAYLOAD_PREFIX } from "../lib/constants.js";

const nexo = new Nexo();

describe("isUUIDPayload", () => {
  it("Returns true when the parameter is a proxy payload", () => {
    const proxy = nexo.create();
    const { id } = map.proxies.get(proxy);
    const result = isUUIDPayload(PAYLOAD_PREFIX + id);

    expect(result).toBe(true);
  });
});
