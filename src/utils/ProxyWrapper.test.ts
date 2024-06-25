import ProxyWrapper from "./ProxyWrapper.js";
import Nexo from "../Nexo.js";
import EventEmitter from "events";

describe("ProxyWrapper", () => {
  it("Access the proxy data", () => {
    const nexo = new Nexo();
    const target = [];
    const proxy = nexo.use("foo", target);
    const wrapper = new ProxyWrapper(proxy);

    expect(wrapper.id).toBe("foo");
    expect(wrapper.target).toBe(target);
    expect(wrapper.events).toBeInstanceOf(EventEmitter);
  });

  it("Can access the original proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = new ProxyWrapper(proxy);

    expect(wrapper.proxy).toBe(proxy);
    expect(nexo.proxy(wrapper.fn)).toBe(proxy);
  });

  it("Can revoke a proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = new ProxyWrapper(proxy);

    wrapper.revoke();

    expect(proxy).toThrow();
  });
});
