import findProxy from "./findProxy.js";
import map from "./map.js";

export default Object.create({
  *[Symbol.iterator]() {
    const proxy = findProxy(this);
    const { sandbox } = map.proxies.get(proxy);
    for (const key of Reflect.ownKeys(sandbox)) {
      yield sandbox[key];
    }
  },
});
