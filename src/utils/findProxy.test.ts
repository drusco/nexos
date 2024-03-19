import Nexo from "../Nexo.js";
import { findProxy, map } from "./index.js";

const nexo = new Nexo();

describe("utils/findProxy", () => {
  it("Finds a proxy by itself", () => {
    const proxy = nexo.create();
    const result = findProxy(proxy);

    expect(result).toStrictEqual(proxy);
  });

  it("Finds a proxy by its target", () => {
    const target = [];
    const proxy = nexo.create(target);
    const result = findProxy(target);

    expect(result).toStrictEqual(proxy);
  });

  it("Finds a proxy by its mock", () => {
    const proxy = nexo.create();
    const { mock } = map.proxies.get(proxy);
    const result = findProxy(mock.deref());

    expect(result).toStrictEqual(proxy);
  });
});
