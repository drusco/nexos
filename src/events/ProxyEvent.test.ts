import type nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyEvent from "./ProxyEvent.js";

describe("ProxyEvent", () => {
  it("Prefixes 'nx.proxy.' to the proxy handler event names", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const handlerName: nx.proxy.handler = "construct";

    const event = new ProxyEvent(handlerName, {
      target: proxy,
    });

    expect(event.name).toBe("nx.proxy." + handlerName);
    expect(event.target).toBe(proxy);
    expect(event.data).toBeUndefined();
  });
});
