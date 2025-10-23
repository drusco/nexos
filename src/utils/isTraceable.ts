/**
 * Determines whether the given value is a traceable object.
 *
 * A value is considered traceable if it is a non-null object or function.
 * This check is used to determine whether the value is eligible to be
 * linked to a proxy in the system's internal tracking.
 *
 * @param value - The value to evaluate.
 * @returns `true` if the value is a traceable object, otherwise `false`.
 */
export default function isTraceable(value: unknown): value is object {
  const isObject = typeof value === "object";
  const isFunction = typeof value === "function";

  if (!isObject && !isFunction) return false;
  if (value === null) return false;

  return true;
}
