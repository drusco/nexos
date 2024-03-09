import Nexo from "../types/Nexo.js";

const isTraceable = (value: unknown): value is Nexo.traceable => {
  const isObject = typeof value === "object";
  const isFunction = typeof value === "function";

  if (!isObject && !isFunction) return false;
  if (value === null) return false;

  return true;
};

export default isTraceable;
