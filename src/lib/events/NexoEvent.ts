import NexoError from "../errors/NexoError.js";

class NexoEvent<Target, Data> {
  readonly name: string;
  readonly data: Data;
  readonly target: Target;
  readonly timestamp: number;
  public returnValue: unknown;
  private _defaultPrevented: boolean;

  constructor(name: string, target?: Target, data?: Data) {
    if (!name.length) {
      throw new NexoError(
        `${this.constructor.name}: event name cannot be empty`,
      );
    }

    this.name = name;
    this.data = data;
    this.target = target;
    this.timestamp = Date.now();
    this._defaultPrevented = false;
  }

  preventDefault(returnValue: unknown): void {
    this._defaultPrevented = true;
    this.returnValue = returnValue;
  }

  get defaultPrevented(): boolean {
    return this._defaultPrevented;
  }
}

export default NexoEvent;
