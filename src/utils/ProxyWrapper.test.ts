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
    expect(wrapper.nexo).toBe(nexo);
  });

  it("Can access the original proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = new ProxyWrapper(proxy);

    expect(wrapper.proxy).toBe(proxy);
    expect(nexo.create(wrapper.fn)).toBe(proxy);
  });

  it("Can revoke a proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = new ProxyWrapper(proxy);

    wrapper.revoke();

    expect(proxy).toThrow();
  });
});
