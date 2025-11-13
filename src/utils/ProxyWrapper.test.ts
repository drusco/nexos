import ProxyEvent from "../events/ProxyEvent.js";
import ProxyManager from "../handlers/__mocks__/ProxyManager.js";
import EventEmitter from "../utils/EventEmitter.js";
import getProxy from "./getProxy.js";
import getProxyWrapper from "./getProxyWrapper.js";
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

  it("prevents updating wrapper when the proxy is revoked", () => {
    const wrapper = new ProxyWrapper();
    const manager = ProxyManager();
    const target = [];
    const emitter = new EventEmitter();

    wrapper.setId("test");
    wrapper.setManager(manager);
    wrapper.setTarget(target);
    wrapper.setEventEmitter(emitter);

    wrapper.revoke();

    wrapper.setId("new_id");
    wrapper.setManager(ProxyManager());
    wrapper.setTarget({ test: true });
    wrapper.setEventEmitter(new EventEmitter());

    expect(wrapper.id).toBe("test");
    expect(wrapper.target).toBe(target);
    expect(wrapper.manager).toBe(manager);
    expect(wrapper.events).toBe(emitter);
  });

  it("allows setting and removing a custom event emitter", () => {
    const wrapper = new ProxyWrapper();
    const emitter = new EventEmitter();

    wrapper.setEventEmitter(emitter);

    expect(wrapper.events).toBe(emitter);

    wrapper.removeEventEmitter();

    expect(wrapper.events).toBeUndefined();
  });

  it("allows passing a function to be called on proxy revocation", () => {
    const revoke = jest.fn();
    const wrapper = new ProxyWrapper(null, revoke);

    wrapper.revoke();

    expect(revoke).toHaveBeenCalledTimes(1);
    expect(revoke).toHaveBeenCalledWith();
    expect(wrapper.revoked).toBe(true);
  });

  it("allows setting and removing a proxy manager instance", () => {
    const wrapper = new ProxyWrapper();
    const manager = ProxyManager();

    wrapper.setManager(manager);

    expect(wrapper.manager).toBe(manager);

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

  it("emits a `proxy.revoke` event to the proxy manager on revoke", () => {
    const proxy = getProxy();
    const wrapper = getProxyWrapper(proxy);
    const manager = ProxyManager();
    const emitter = manager.events.emit as jest.Mock;

    wrapper.setManager(manager);
    wrapper.revoke();

    const [, event]: [string, nx.ProxyRevokeEvent] = emitter.mock.lastCall;

    expect(emitter).toHaveBeenCalledWith("proxy.revoke", event);
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(false);
    expect(event.data).toBe(wrapper);
  });
});
