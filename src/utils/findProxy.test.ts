import Nexo from "../Nexo.js";
import findProxy from "./findProxy.js";

const nexo = new Nexo();

describe("findProxy", () => {
  it("Finds a proxy by itself", () => {
    const proxy = nexo.create();
    const result = findProxy(proxy);

    expect(result).toBe(proxy);
  });

  it("Finds a proxy by a traceable value (target)", () => {
    const target = [];
    const proxy = nexo.create(target);
    const result = findProxy(target);

    expect(result).toBe(proxy);
  });

  it("Returns undefined when the proxy is not found", () => {
    const result = findProxy({});

    expect(result).toBeUndefined();
  });
});
