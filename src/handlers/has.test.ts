import Nexo from "../Nexo.js";

describe("has", () => {
  it("Emits an event with custom data", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();

    nexo.on("proxy.has", listener);
    wrapper.on("proxy.has", listener);

    Reflect.has(proxy, "foo");
  });
});
