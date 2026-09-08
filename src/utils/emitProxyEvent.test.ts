import ProxyEvent from "../events/ProxyEvent.js";
import ProxyManager from "../handlers/__mocks__/ProxyManager.js";
import emitProxyEvent from "./emitProxyEvent.js";
import ProxyWrapper from "./ProxyWrapper.js";

describe("emitProxyEvent", () => {
  it("fans a proxy event out to the manager and wrapper emitters", () => {
    const wrapper = new ProxyWrapper();
    const manager = ProxyManager();
    const event = new ProxyEvent("get", { target: wrapper.proxy });

    wrapper.setManager(manager);

    const wrapperEmit = jest.spyOn(wrapper.events, "emit");

    emitProxyEvent(wrapper, event);

    expect(manager.events.emit).toHaveBeenCalledWith("proxy.get", event);
    expect(wrapperEmit).toHaveBeenCalledWith("proxy.get", event);
  });
});
