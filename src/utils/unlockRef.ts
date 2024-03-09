const unlockRef = (value: unknown): unknown => {
  while (value instanceof WeakRef) {
    value = value.deref();
  }

  return value;
};

export default unlockRef;
