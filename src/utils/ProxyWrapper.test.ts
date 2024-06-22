import ProxyWrapper from "./ProxyWrapper.js";
import Nexo from "../Nexo.js";
import EventEmitter from "events";

describe("ProxyWrapper", () => {
  it("Access proxy data", () => {
    const nexo = new Nexo();
    const target = [];
    const proxy = nexo.use("foo", target);
    const wrapper = new ProxyWrapper(proxy);

    expect(wrapper.proxy).toBe(proxy);
    expect(wrapper.id).toBe("foo");
    expect(wrapper.target).toBe(target);
    expect(wrapper.events).toBeInstanceOf(EventEmitter);
    expect(nexo.proxy(wrapper.fn)).toBe(proxy);
  });
});
