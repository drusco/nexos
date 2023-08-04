import findProxy from "./findProxy";
import map from "./map";

export default Object.assign(Object.create(null), {
  [Symbol.iterator]() {
    const proxy = findProxy(this);
    const { sandbox } = map.proxies.get(proxy);
    return function* () {
      for (const key of Reflect.ownKeys(sandbox)) {
        yield sandbox[key];
      }
    };
  },
});
