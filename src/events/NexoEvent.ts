import type * as nx from "../types/Nexo.js";

/**
 * Represents an event with additional properties and methods for managing event behavior.
 * This class allows for the specification of event data and target and provides
 * functionality to prevent the default behavior of an event if it is cancelable.
 *
 * @typeParam Target - The type of the event's target (default: `unknown`).
 * @typeParam Data - The type of data associated with the event (default: `unknown`).
 *
 * @example
 * const event = new NexoEvent('proxy', { data: { message: 'New proxy created!' }, cancelable: true });
 * event.preventDefault();
 */
class NexoEvent<Target = unknown, Data = unknown>
  implements nx.NexoEvent<Target, Data>
{
  /** The name of the event. */
  readonly name: string;

  /** The data associated with the event. */
  readonly data: Data;

  /** The target to which the event is dispatched. */
  readonly target: Target;

  /** The timestamp indicating when the event was created. */
  readonly timestamp: number;

  /** Indicates whether the event is cancelable. */
  readonly cancelable: boolean;

  /** The value to be returned by the event after it has been processed. */
  public returnValue: unknown;

  /** The internal flag that tracks whether the default behavior has been prevented. */
  private _defaultPrevented: boolean;

  /**
   * Creates an instance of the `NexoEvent`.
   *
   * @param name - The name of the event.
   * @param options - Options to configure the event (e.g., `data`, `target`, `cancelable`).
   * @param options.data - The data associated with the event.
   * @param options.target - The target of the event.
   * @param options.cancelable - A boolean flag indicating whether the event can be canceled (default: `false`).
   *
   * @example
   * const event = new NexoEvent('proxy', { data: { message: 'New proxy created!' }, cancelable: true });
   */
  constructor(
    name: string,
    options: Partial<{ data: Data; target: Target; cancelable: boolean }> = {},
  ) {
    const { data, target, cancelable = false } = options;

    this.name = name;
    this.data = data;
    this.target = target;
    this.cancelable = cancelable;
    this.timestamp = Date.now();
    this._defaultPrevented = false;
  }

  /**
   * Prevents the default behavior of the event if it is cancelable.
   *
   * @remarks
   * If the event is not cancelable, this method has no effect.
   *
   * @example
   * const event = new NexoEvent('proxy', { cancelable: true });
   * event.preventDefault(); // Prevents the default behavior
   */
  preventDefault(): void {
    if (!this.cancelable) {
      return;
    }

    this._defaultPrevented = true;
  }

  /**
   * Gets whether the default behavior of the event has been prevented.
   *
   * @returns `true` if the default behavior has been prevented; otherwise `false`.
   *
   * @example
   * const event = new NexoEvent('proxy', { cancelable: true });
   * event.preventDefault();
   * console.log(event.defaultPrevented); // true
   */
  get defaultPrevented(): boolean {
    return this._defaultPrevented;
  }
}

export default NexoEvent;
