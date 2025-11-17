import ProxyEvent from "../events/ProxyEvent.js";
import ProxyManager from "../handlers/__mocks__/ProxyManager.js";
import EventEmitter from "../utils/EventEmitter.js";
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
    expect(wrapper.target).not.toBeUndefined();
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

    expect(wrapper.target).not.toBeUndefined();
    expect(wrapper.traceable).toBe(false);

    wrapper.setTarget(target);

    expect(wrapper.target).toBe(target);
    expect(wrapper.traceable).toBe(true);
  });

  it("emits a `revoke` event to the proxy manager on revoke", () => {
    const { proxy } = new ProxyWrapper();
    const wrapper = getProxyWrapper(proxy);
    const manager = ProxyManager();
    const emitter = manager.events.emit as jest.Mock;

    wrapper.setManager(manager);
    wrapper.revoke();

    const [eventName, event]: [string, nx.ProxyWrapperEvent] =
      emitter.mock.lastCall;

    expect(eventName).toBe("proxy.revoke");
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(false);
    expect(event.data).toBe(wrapper);
  });

  it("emits a `rename` event to the proxy manager on id change", () => {
    const { proxy } = new ProxyWrapper();
    const wrapper = getProxyWrapper(proxy);
    const manager = ProxyManager();
    const emitter = manager.events.emit as jest.Mock;

    wrapper.setManager(manager);
    wrapper.setId("test");

    const [, event]: [string, nx.ProxyWrapperEvent] = emitter.mock.lastCall;

    expect(emitter).toHaveBeenCalledWith("proxy.rename", event);
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(false);
    expect(event.data).toBe(wrapper);
    expect(event.data.id).toBe("test");
  });

  it("emits a `manager change` event to the proxy manager", () => {
    const { proxy } = new ProxyWrapper();
    const wrapper = getProxyWrapper(proxy);
    const manager = ProxyManager();
    const emitter = manager.events.emit as jest.Mock;

    wrapper.setManager(manager);

    const [, event]: [string, nx.ProxyWrapperEvent] = emitter.mock.lastCall;

    expect(emitter).toHaveBeenCalledWith("proxy.manager", event);
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(false);
    expect(event.data).toBe(wrapper);
    expect(event.data.manager).toBe(manager);
  });
});
