import Exotic from "../types/Exotic.js";
import findProxy from "./findProxy.js";
import map from "./map.js";

const mockPrototype: Exotic.mock.prototype = {
  *[Symbol.iterator]() {
    const proxy = findProxy(this) as Exotic.Proxy;
    const { sandbox } = map.proxies.get(proxy);

    for (const key of Object.keys(sandbox)) {
      yield sandbox[key];
    }
  },
};

export default mockPrototype;
