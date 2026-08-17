import isProxy from "./isProxy.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyManager from "../handlers/__mocks__/ProxyManager.js";
import EventEmitter from "../utils/EventEmitter.js";
import getProxyWrapper from "./getProxyWrapper.js";
import ProxyWrapper from "./ProxyWrapper.js";

describe("ProxyWrapper", () => {
  it("creates a wrapper that provides access to proxy metadata", () => {
    const wrapper = new ProxyWrapper();

    expect(typeof wrapper.id).toBe("string");
    expect(typeof wrapper.lock).toBe("function");
    expect(typeof wrapper.unlock).toBe("function");
    expect(typeof wrapper.setManager).toBe("function");
    expect(typeof wrapper.setTarget).toBe("function");
    expect(typeof wrapper.setId).toBe("function");

    expect(wrapper.locked).toBe(false);
    expect(wrapper.traceable).toBe(false);
    expect(wrapper.target).not.toBeUndefined();
    expect(wrapper.manager).toBeUndefined();
    expect(wrapper.events).toBeInstanceOf(EventEmitter);
  });

  it("allows to temporarily lock the proxy", () => {
    const wrapper = new ProxyWrapper();
    wrapper.lock();

    expect(wrapper.locked).toBe(true);

    wrapper.unlock();

    expect(wrapper.locked).toBe(false);
  });

  it("prevents updating wrapper when the proxy is locked", () => {
    const wrapper = new ProxyWrapper();
    const manager = ProxyManager();
    const target = [];

    wrapper.setId("test");
    wrapper.setManager(manager);
    wrapper.setTarget(target);

    wrapper.lock();

    wrapper.setId("new_id");
    wrapper.setManager(ProxyManager());
    wrapper.setTarget({ test: true });

    expect(wrapper.id).toBe("test");
    expect(wrapper.target).toBe(target);
    expect(wrapper.manager).toBe(manager);
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

  it("emits a `proxy.lock` event when the proxy is locked", () => {
    const { proxy } = new ProxyWrapper();
    const wrapper = getProxyWrapper(proxy);
    const manager = ProxyManager();
    const emitter = manager.events.emit as jest.Mock;

    wrapper.setManager(manager);
    wrapper.lock();

    const [eventName, event]: [string, nx.ProxyWrapperEvent] =
      emitter.mock.lastCall;

    expect(eventName).toBe("proxy.lock");
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(false);
    expect(event.data).toBe(wrapper);
  });

  it("emits a `proxy.rename` event when the proxy id is updated", () => {
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

  it("emits a `proxy.manager` event when the manager is updated", () => {
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

  it("emits a `proxy.target` event when the target is updated", () => {
    const wrapper = new ProxyWrapper();
    const proxy = wrapper.proxy;
    const manager = ProxyManager();
    const emitter = manager.events.emit as jest.Mock;
    const newTarget = { foo: true };

    wrapper.setManager(manager);
    wrapper.setTarget(newTarget);

    const [, event]: [string, nx.ProxyWrapperEvent] = emitter.mock.lastCall;

    expect(emitter).toHaveBeenCalledWith("proxy.target", event);
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.target).toBe(wrapper.proxy);
    expect(event.cancelable).toBe(false);
    expect(event.data).toBe(wrapper);
    expect(wrapper.target).toBe(newTarget);
    expect(wrapper.proxy).not.toBe(proxy);
    expect(isProxy(wrapper.proxy)).toBe(true);
  });
});
