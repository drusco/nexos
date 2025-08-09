import Nexo from "../Nexo.js";
import NexoEmitter from "../utils/NexoEmitter.js";
import ProxyWrapper from "./ProxyWrapper.js";

describe("ProxyWrapper", () => {
  it("Access the proxy details", () => {
    const nexo = new Nexo();
    const proxy = nexo.use("foo");
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
    expect(wrapper).toBeInstanceOf(NexoEmitter);
    expect(wrapper.id).toBe("foo");
    expect(wrapper.nexo).toBe(nexo);
    expect(wrapper.revoked).toBe(false);
  });

  it("Can revoke a proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    wrapper.revoke();

    expect(proxy).toThrow();
    expect(wrapper.revoked).toBe(true);
  });
});
