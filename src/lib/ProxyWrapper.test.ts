import EventEmitter from "events";
import Nexo from "./Nexo.js";
import ProxyWrapper from "./ProxyWrapper.js";

describe("ProxyWrapper", () => {
  it("Is extends the EventEmitter class", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper).toBeInstanceOf(ProxyWrapper);
    expect(wrapper).toBeInstanceOf(EventEmitter);
  });

  it("Exposes information about the proxy", () => {
    const nexo = new Nexo();

    const id = "foo";
    const target = [];

    const proxy = nexo.use(id, target);
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper.id).toBe(id);
    expect(wrapper.target).toBe(target);
  });
});
