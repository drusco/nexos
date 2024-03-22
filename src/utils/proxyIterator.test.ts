import Nexo from "../lib/NexoProxy.js";
import NexoTS from "../lib/types/Nexo.js";
import { proxyIterator } from "./index.js";
import map from "../lib/maps.js";

const nexo = new Nexo();

describe("proxyIterator", () => {
  it("Returns an iterable iterator of proxies", () => {
    const foo = nexo.create();
    const bar = nexo.create();

    const iterator = proxyIterator(nexo);
    const proxies = [...iterator];

    expect(proxies.length).toBe(2);
    expect(proxies.includes(foo)).toBe(true);
    expect(proxies.includes(bar)).toBe(true);
  });

  it("Emits a deletion event when the proxy does not exists anymore", () => {
    const proxy = nexo.create();
    const { id } = map.proxies.get(proxy);
    const callback = jest.fn();

    const weakRefMock = {
      deref() {},
    } as WeakRef<NexoTS.Proxy>;

    nexo.entries.set(id, weakRefMock);
    nexo.addListener("nx.delete", callback);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const proxies = [...proxyIterator(nexo)];

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(id);
  });
});
