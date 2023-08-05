import findProxy from "./findProxy";

const isTraceable = (value: any): boolean => {
  const isObject = typeof value === "object";
  const isFunction = typeof value === "function";

  if (!isObject && !isFunction) return false;
  if (value === null) return false;
  if (findProxy(value)) return false;

  return true;
};

export default isTraceable;
