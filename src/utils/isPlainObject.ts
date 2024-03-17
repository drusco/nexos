import Nexo from "../types/Nexo.js";

const isPlainObject = (value: unknown): value is Nexo.plainObject => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return (
    (prototype === null ||
      prototype === Object.prototype ||
      Object.getPrototypeOf(prototype) === null) &&
    !(Symbol.toStringTag in value) &&
    !(Symbol.iterator in value)
  );
};

export default isPlainObject;
