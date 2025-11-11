import { isProxy } from "util/types";
import emitProxy from "./emitProxy.js";
import ProxyError from "./ProxyError.js";
import getProxy from "./getProxy.js";
import Nexo from "../Nexo.js";
import getProxyWrapper from "./getProxyWrapper.js";
import Event from "../events/Event.js";

describe("emitProxy", () => {
  it("throws an error if the provided object is not a proxy", () => {
    const object = {};

    expect(isProxy(object)).toBe(false);
    expect(() => emitProxy(object)).toThrow(ProxyError);
  });

  it("emits a `proxy` creation event", async () => {
    const nexo = new Nexo();
    const proxy = getProxy();
    const wrapper = getProxyWrapper(proxy);
    const listener = jest.fn();

    wrapper.setManager(nexo);
    nexo.events.on("proxy", listener);

    const result = emitProxy(proxy);
    const [event]: [nx.ProxyCreateEvent] = listener.mock.lastCall;
    const getResult = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(event).toBeInstanceOf(Event);
    expect(event.cancelable).toBe(true);
    expect(event.data).toStrictEqual({
      id: wrapper.id,
      target: wrapper.target,
      result: event.data.result,
    });
    expect(getResult()).toBe(proxy);
    expect(result).toBe(proxy);
  });

  it("allows replacing the emitted proxy with a different one", async () => {
    const nexo = new Nexo();
    const proxy = getProxy();
    const wrapper = getProxyWrapper(proxy);
    let customProxy: nx.Proxy;

    wrapper.setManager(nexo);

    nexo.events.on("proxy", (event) => {
      event.preventDefault();
      customProxy = getProxy();
      const wrapper = getProxyWrapper(customProxy);
      wrapper.setManager(nexo);
      return customProxy;
    });

    const result = emitProxy(proxy);
    const newWrapper = getProxyWrapper(result);

    expect(result).toBe(customProxy);
    expect(isProxy(result)).toBe(true);
    expect(wrapper.revoked).toBe(true);
    expect(nexo.entries.get(wrapper.id)).toBeUndefined();
    expect(nexo.entries.size).toBe(1);
    expect(nexo.entries.get(newWrapper.id).deref()).toBe(result);
  });
});
