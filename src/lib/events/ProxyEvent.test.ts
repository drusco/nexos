import ProxyNexo from "../ProxyNexo.js";
import NexoTS from "../types/Nexo.js";
import ProxyEvent from "./ProxyEvent.js";

const nexo = new ProxyNexo();

const proxyEventNames = [
  "get",
  "has",
  "deleteProperty",
  "getOwnPropertyDescriptor",
  "set",
  "defineProperty",
  "apply",
  "construct",
  "getPrototypeOf",
  "isExtensible",
  "ownKeys",
  "preventExtensions",
  "setPrototypeOf",
];

describe("ProxyEvent", () => {
  it("Adds nx.proxy prefix to the proxy handler event names", () => {
    const proxy = nexo.createProxy();

    proxyEventNames.forEach((eventName) => {
      const event = new ProxyEvent(
        eventName as NexoTS.proxy.handlerName,
        proxy,
      );

      expect(event.name).toBe("nx.proxy." + eventName);
      expect(event.target).toBe(proxy);
    });
  });
});
