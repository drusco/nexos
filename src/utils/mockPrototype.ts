import findProxy from "./findProxy";
import map from "./map";

export default class Mock extends EventTarget {
  constructor() {
    super();
  }
  *[Symbol.iterator]() {
    const proxy = findProxy(this);
    const { sandbox } = map.proxies.get(proxy);
    for (const key of Reflect.ownKeys(sandbox)) {
      yield sandbox[key];
    }
  }
}
