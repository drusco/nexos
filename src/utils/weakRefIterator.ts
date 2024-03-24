const weakRefIterator = function* <T extends object>(
  map: Map<string, WeakRef<T>>,
): IterableIterator<T> {
  for (const [, ref] of map) {
    const value = ref.deref();
    if (value) {
      yield value;
    }
  }
};

export default weakRefIterator;
