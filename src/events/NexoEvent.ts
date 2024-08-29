import type nx from "../types/Nexo.js";

class NexoEvent<Target = unknown, Data = unknown> {
  readonly name: string;
  readonly data: Data;
  readonly target: Target;
  readonly timestamp: number;
  readonly cancelable: boolean;
  public returnValue: unknown;
  private _defaultPrevented: boolean;

  constructor(name: string, options: nx.event.options<Target, Data> = {}) {
    options = { cancelable: false, ...options };
    this.name = name;
    this.data = options.data;
    this.target = options.target;
    this.cancelable = options.cancelable;
    this.timestamp = Date.now();
    this._defaultPrevented = false;
  }

  preventDefault(): void {
    if (!this.cancelable) {
      return;
    }

    this._defaultPrevented = true;
  }

  get defaultPrevented(): boolean {
    return this._defaultPrevented;
  }
}

export default NexoEvent;
