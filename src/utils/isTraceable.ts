import type * as nx from "../types/Nexo.js";

/**
 * Determines whether the given value is a {@link nx.Traceable | Traceable} entity.
 *
 * A value is considered traceable if it is a non-null object or function.
 * This check is used to determine whether the value is eligible to be
 * linked to a proxy in the system's internal tracking.
 *
 * Acts as a type guard to narrow the type to {@link nx.Traceable | Traceable}.
 *
 * @param value - The value to evaluate.
 * @returns `true` if the value is {@link nx.Traceable | Traceable}, otherwise `false`.
 */
const isTraceable = (value: unknown): value is nx.Traceable => {
  const isObject = typeof value === "object";
  const isFunction = typeof value === "function";

  if (!isObject && !isFunction) return false;
  if (value === null) return false;

  return true;
};

export default isTraceable;
