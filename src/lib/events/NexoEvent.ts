class NexoEvent<Target = unknown, Data = unknown, Return = unknown> {
  readonly name: string;
  readonly data: Data;
  readonly target: Target;
  readonly timestamp: number;
  public returnValue: Return;
  private _defaultPrevented: boolean;

  constructor(name: string, target?: Target, data?: Data) {
    this.name = name;
    this.data = data;
    this.target = target;
    this.timestamp = Date.now();
    this._defaultPrevented = false;
  }

  preventDefault(returnValue?: Return): void {
    this._defaultPrevented = true;
    this.returnValue = returnValue;
  }

  get defaultPrevented(): boolean {
    return this._defaultPrevented;
  }
}

export default NexoEvent;
