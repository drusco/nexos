/**
 * @noInheritDoc
 * Represents an error that occurs during a proxy operation.
 *
 * Extends the built-in `Error` class by adding a `target` property,
 * which references the object associated with the error.
 */
class ProxyError extends Error implements nx.ProxyError {
  readonly name: string = "ProxyError";

  /** The object associated with this error. */
  readonly target: object;

  /**
   * Creates an instance of the `ProxyError`.
   *
   * @param message - The error message to be associated with this error.
   * @param target - The object that is the source of the error.
   *
   */
  constructor(message: string, target: object) {
    super(message);
    this.target = target;
  }
}

export default ProxyError;
