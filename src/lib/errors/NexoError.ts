class NexoError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NexoError.prototype);
  }
}

export default NexoError;
