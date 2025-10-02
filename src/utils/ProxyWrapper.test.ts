import Nexo from "../Nexo.js";
import EventEmitter from "../utils/EventEmitter.js";
import ProxyWrapper from "./ProxyWrapper.js";

describe("ProxyWrapper", () => {
  it("creates a wrapper that provides access to proxy metadata", () => {
    const wrapper = new ProxyWrapper();

    expect(typeof wrapper.id).toBe("string");
    expect(typeof wrapper.revoke).toBe("function");
    expect(typeof wrapper.setEventEmitter).toBe("function");
    expect(typeof wrapper.removeEventEmitter).toBe("function");
    expect(typeof wrapper.setManager).toBe("function");
    expect(typeof wrapper.setTarget).toBe("function");
    expect(typeof wrapper.setId).toBe("function");

    expect(wrapper.revoked).toBe(false);
    expect(wrapper.traceable).toBe(false);
    expect(wrapper.target).toBeUndefined();
    expect(wrapper.manager).toBeUndefined();
    expect(wrapper.events).toBeInstanceOf(EventEmitter);
  });

  it("allows to revoke the proxy", () => {
    const wrapper = new ProxyWrapper();
    wrapper.revoke();

    expect(wrapper.revoked).toBe(true);
  });

  it("allows passing a function to be called on proxy revocation", () => {
    const revoke = jest.fn();
    const wrapper = new ProxyWrapper(revoke);

    wrapper.revoke();

    expect(revoke).toHaveBeenCalledTimes(1);
    expect(revoke).toHaveBeenCalledWith();
    expect(wrapper.revoked).toBe(true);
  });

  it("allows setting and removing a proxy manager instance", () => {
    const wrapper = new ProxyWrapper();
    const nexo = new Nexo();

    wrapper.setManager(nexo);

    expect(wrapper.manager).toBe(nexo);

    wrapper.removeManager();

    expect(wrapper.manager).toBeUndefined();
  });

  it("allows setting a custom identifier", () => {
    const wrapper = new ProxyWrapper();
    wrapper.setId("foo");

    expect(wrapper.id).toBe("foo");
  });

  it("allows setting an arbitrary traceable target object", () => {
    const wrapper = new ProxyWrapper();
    const target = [];

    expect(wrapper.target).toBeUndefined();
    expect(wrapper.traceable).toBe(false);

    wrapper.setTarget(target);

    expect(wrapper.target).toBe(target);
    expect(wrapper.traceable).toBe(true);
  });

  it("allows indicating whether the target is traceable or not", () => {
    const wrapper = new ProxyWrapper();
    const target = [];

    wrapper.setTarget(target, false);

    expect(wrapper.target).toBe(target);
    expect(wrapper.traceable).toBe(false);
  });
});
