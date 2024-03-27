class NexoEvent<Target = unknown, Data = unknown, Return = unknown> {
  readonly name: string;
  readonly data: Data;
  readonly target: Target;
  readonly timestamp: number;
  readonly cancellable: boolean;
  public returnValue: Return;
  private _defaultPrevented: boolean;

  constructor(
    name: string,
    options: {
      target?: Target;
      data?: Data;
      cancellable?: boolean;
    } = { cancellable: false },
  ) {
    this.name = name;
    this.data = options.data;
    this.target = options.target;
    this.cancellable = options.cancellable;
    this.timestamp = Date.now();
    this._defaultPrevented = false;
  }

  preventDefault(returnValue?: Return): void {
    if (!this.cancellable) {
      return;
    }

    this._defaultPrevented = true;
    this.returnValue = returnValue;
  }

  get defaultPrevented(): boolean {
    return this._defaultPrevented;
  }
}

export default NexoEvent;
