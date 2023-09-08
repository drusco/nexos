import Emulator from "../../Emulator.js";
import constants from "../../utils/constants.js";
const $ = new Emulator();

describe("(method) exec", () => {
  it("Converts the first parameter (function) into a string and uses it as the proxy's target", () => {
    const method = function () {};
    const proxy = $.exec(method);

    expect($.target(proxy)).toEqual(method.toString());
  });

  it("Uses the second parameter, an optional dependencies object, to replace each object key with the encoded proxy value", () => {
    const proxyReference = $.use();
    const anotherProxy = $.use();
    const method = () => {
      proxyReference.ok = true;
      anotherProxy();
    };
    const proxy = $.exec(method, { proxyReference, anotherProxy });

    expect($.target(proxy)).toEqual(
      method
        .toString()
        .replace("proxyReference", $.encode(proxyReference))
        .replace("anotherProxy", $.encode(anotherProxy)),
    );
  });

  it("Calls a return function once the proxy gets revoked", () => {
    const mock = jest.fn();
    const callback = $.use(mock);

    $.on("proxy", (id, origin, target) => {
      if (target === constants.FUNCTION_TARGET) return;
      const proxy = $.include(id, origin, target);
      $.revoke(proxy);
    });

    $.exec(
      () => {
        return () => {
          callback();
        };
      },
      { callback },
    );

    expect(mock).toHaveBeenCalledTimes(1);
  });
});
