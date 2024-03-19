import Nexo from "../Nexo.js";
import { constants, isProxyPayload, map } from "./index.js";

const nexo = new Nexo();

describe("isProxyPayload", () => {
  it("Returns true when the parameter is a proxy payload", () => {
    const proxy = nexo.create();
    const { id } = map.proxies.get(proxy);
    const result = isProxyPayload(constants.NO_BREAK + id);

    expect(result).toBe(true);
  });
});
