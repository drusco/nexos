import ProxyWrapper from "./ProxyWrapper.js";
import Nexo from "../Nexo.js";
import NexoEmitter from "../events/NexoEmitter.js";

describe("ProxyWrapper", () => {
  it("Access the proxy data", () => {
    const nexo = new Nexo();
    const target = [];
    const proxy = nexo.use("foo", target);
    const wrapper = new ProxyWrapper(proxy);

    expect(wrapper.id).toBe("foo");
    expect(wrapper.target).toBe(target);
    expect(wrapper.events).toBeInstanceOf(NexoEmitter);
    expect(wrapper.nexo).toBe(nexo);
    expect(wrapper.proxy).toBe(proxy);
    expect(wrapper.revoked).toBe(false);
    expect(nexo.create(wrapper.fn)).toBe(proxy);
  });

  it("Can revoke a proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = new ProxyWrapper(proxy);

    wrapper.revoke();

    expect(proxy).toThrow();
    expect(wrapper.revoked).toBe(true);
  });
});
