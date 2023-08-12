// https://github.com/tc39/proposal-weakrefs/blob/master/README.md#iterable-weakmaps

type weakRef = WeakRef<object>;
type keyValuePairs = [object, unknown];
type valueRef = { value: unknown; ref: weakRef };

export default class IterableWeakMap {
  #weakMap: WeakMap<object, valueRef> = new WeakMap();
  #refSet: Set<weakRef> = new Set();
  #finalizationGroup = new FinalizationRegistry(IterableWeakMap.#cleanup);

  static #cleanup({ set, ref }) {
    console.log("clear", ref.deref());
    set.delete(ref);
  }

  constructor(iterable: Iterable<keyValuePairs>) {
    for (const [key, value] of iterable) {
      this.set(key, value);
    }
  }

  set(key: object, value: unknown): void {
    const ref = new WeakRef(key);

    this.#weakMap.set(key, { value, ref });
    this.#refSet.add(ref);
    this.#finalizationGroup.register(
      key,
      {
        set: this.#refSet,
        ref,
      },
      ref,
    );
  }

  get(key: object): unknown {
    const entry = this.#weakMap.get(key);
    return entry && entry.value;
  }

  delete(key: object): boolean {
    const entry = this.#weakMap.get(key);
    if (!entry) {
      return false;
    }

    this.#weakMap.delete(key);
    this.#refSet.delete(entry.ref);
    this.#finalizationGroup.unregister(entry.ref);
    return true;
  }

  *[Symbol.iterator](): IterableIterator<keyValuePairs> {
    for (const ref of this.#refSet) {
      const key = ref.deref();
      if (!key) continue;
      const { value } = this.#weakMap.get(key);
      yield [key, value];
    }
  }

  entries(): IterableIterator<keyValuePairs> {
    return this[Symbol.iterator]();
  }

  *keys() {
    for (const [key] of this) {
      yield key;
    }
  }

  *values() {
    for (const [, value] of this) {
      yield value;
    }
  }
}
