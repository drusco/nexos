/** An array of values of any type. */
export type ArrayLike = unknown[];

/** A non-null object or function that can be tracked as a proxy target. */
export type Traceable = NonNullable<object | FunctionLike>;

/** A valid object property key: a string or a symbol. */
export type ObjectKey = string | symbol;

/**
 * Represents any function type.
 *
 * @typeParam Args - Tuple type of accepted arguments.
 * @typeParam Return - Return type of the function.
 */
export type FunctionLike<
  Args extends ArrayLike = ArrayLike,
  Return = unknown,
> = (...args: Args) => Return;

/** A function returning a proxy or `undefined`. */
export type resolveProxy = FunctionLike<[], Proxy | undefined>;

/**
 * Names of the built-in {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy#handler_functions | Proxy handler traps}.
 */
export type ProxyHandler =
  | "get"
  | "has"
  | "deleteProperty"
  | "getOwnPropertyDescriptor"
  | "set"
  | "defineProperty"
  | "apply"
  | "construct"
  | "getPrototypeOf"
  | "isExtensible"
  | "ownKeys"
  | "preventExtensions"
  | "setPrototypeOf";

/**
 * A specialized map that stores weak references to {@link Traceable} values,
 * with built-in event emitting capabilities.
 *
 * Each operation on the map can emit lifecycle events through an attached
 * {@link EventEmitter}. By default, the map provides a no-op emitter,
 * but a custom emitter can be set or removed.
 *
 * @typeParam Type - The type of {@link Traceable} values stored.
 */
export interface TraceableMap<Type extends Traceable>
  extends Map<string, WeakRef<Type>>,
    EventEmittable {
  /** Removes entries whose `WeakRef` targets have been garbage collected. */
  release(): void;
}

/**
 * Describes an event with metadata and methods to control its behavior.
 *
 * @typeParam Target - Event target type.
 * @typeParam Data - Event data type.
 */
export interface NexoEvent<Target = unknown, Data = unknown> {
  /** Event name. */
  readonly name: string;
  /** Event payload data. */
  readonly data: Data;
  /** Target the event was dispatched to. */
  readonly target: Target;
  /** Timestamp when the event was created (ms since epoch). */
  readonly timestamp: number;
  /** Whether the event can be canceled. */
  readonly cancelable: boolean;
  /** Whether the default action was prevented. */
  readonly defaultPrevented: boolean;
  /** Value assigned after the event is processed. */
  returnValue: unknown;
  /** Prevents the default action if the event is cancelable. */
  preventDefault(): void;
}

export interface EventEmittable {
  /**
   * The internal event emitter instance responsible for managing lifecycle events.
   */
  readonly events?: EventEmitter;
  /**
   * Attaches an {@link EventEmitter} to handle lifecycle events.
   *
   * @param emitter - The event emitter instance to attach.
   * @returns The current instance, for method chaining.
   */
  setEventEmitter(emitter: EventEmitter): this;
  /** Detaches the current event emitter. */
  removeEventEmitter(): void;
}

export interface EventListener {
  /** The arguments passed to the event listener. */
  args: ArrayLike;
  /** The value returned by the event listener, if any. */
  result?: unknown;
}

/**
 * A minimal event emitter interface for registering, removing,
 * and invoking event listeners.
 */
export interface EventEmitter<
  Events extends Record<string, EventListener> = Record<string, EventListener>,
> {
  /**
   * Registers a listener for a specific event.
   *
   * @param event - The name of the event to listen to.
   * @param listener - The function to invoke when the event is emitted.
   * @returns The current emitter instance, for method chaining.
   */
  on<Name extends keyof Events>(
    event: Name,
    listener: (...args: Events[Name]["args"]) => Events[Name]["result"],
  ): this;

  on(event: string, listener: FunctionLike): this;

  /**
   * Removes a previously registered listener for a specific event.
   *
   * @param event - The name of the event.
   * @param listener - The listener function to remove.
   * @returns The current emitter instance, for method chaining.
   */
  off<Name extends keyof Events>(
    event: Name,
    listener: (...args: Events[Name]["args"]) => Events[Name]["result"],
  ): this;

  off(event: string, listener: FunctionLike): this;

  /**
   * Emits an event to all registered listeners.
   *
   * @param event - The name of the event to emit.
   * @param data - The arguments passed to the listeners.
   * @returns `true` if one or more listeners were invoked, `false` otherwise.
   */
  emit<Name extends keyof Events>(
    event: Name,
    ...data: Events[Name]["args"]
  ): boolean;

  emit(event: string, ...data: ArrayLike): boolean;
}

/**
 * Proxy factory and manager.
 */
export interface Nexo extends EventEmittable {
  /** Weak reference map of active proxies. */
  readonly entries: TraceableMap<Proxy>;
  /**
   * Retrieves an existing proxy by ID or creates one if it does not exist.
   *
   * @param id - Unique proxy identifier.
   * @param target - Optional target to wrap.
   */
  use(id: string, target?: Traceable): Proxy;
  /**
   * Creates a new proxy for the given target.
   *
   * @param target - Optional target to wrap.
   */
  create(target?: Traceable): Proxy;
}

/**
 * A proxy-wrapped traceable object or function.
 */
export interface Proxy {
  [key: ObjectKey]: unknown;
  name: unknown;
  apply: unknown;
  bind: unknown;
  call: unknown;
  caller: unknown;
  length: unknown;
  toString: unknown;
  /**
   * Constructor signature for the proxy.
   *
   * @typeParam Args - Constructor argument types.
   * @typeParam Instance - Instance type returned by `new`.
   */
  new <Args extends ArrayLike = ArrayLike, Instance extends Traceable = Proxy>(
    ...args: Args
  ): Instance;
  /**
   * Callable signature for the proxy.
   *
   * @typeParam Args - Function argument types.
   * @typeParam Return - Return type of the call.
   */
  <Args extends ArrayLike = ArrayLike, Return = Proxy>(...args: Args): Return;
}

/**
 * Wraps a proxy instance, manages events, and handles lifecycle operations.
 */
export interface ProxyWrapper extends EventEmittable {
  /** Internal event emitter */
  readonly events: EventEmitter<ProxyEvents>;
  /** Unique proxy wrapper ID. */
  readonly id: string;
  /** The parent {@link Nexo} instance. */
  readonly nexo: Nexo;
  /** Whether the proxy has been revoked. */
  readonly revoked: boolean;
  /** Whether the proxy was created with a {@link Traceable} object */
  readonly traceable: boolean;
  /** Revokes the proxy, making it unusable. */
  revoke(): void;
}

/** Error specific to proxy operations. */
export interface ProxyError extends Error {
  /** Proxy instance that caused the error. */
  readonly proxy: Proxy;
  readonly name: string;
}

/**
 * Event triggered by a proxy operation.
 *
 * @typeParam Data - Event data type.
 */
export interface ProxyEvent<Data = unknown> extends NexoEvent<Proxy, Data> {
  /** Value returned by event listeners. */
  readonly returnValue: unknown;
  /** Always `true` — proxy events are cancelable. */
  readonly cancelable: true;
}

/** Fired when a proxy-wrapped function is invoked. */
export interface ProxyApplyEvent extends ProxyEvent {
  readonly returnValue: unknown;
  readonly data: {
    /** Target function being called. */
    readonly target: Traceable;
    /** `this` value for the call. */
    readonly thisArg: unknown;
    /** Arguments passed to the call. */
    readonly args: ArrayLike;
    /** Result of the call. */
    readonly result: Promise<FunctionLike<[], unknown>>;
  };
}

/** Fired when a proxy-wrapped constructor is called via `new`. */
export interface ProxyConstructEvent extends ProxyEvent {
  readonly returnValue: Traceable;
  readonly data: {
    /** Constructor function being called. */
    readonly target: Traceable;
    /** Arguments passed to the constructor. */
    readonly args: ArrayLike;
    /** Resulting instance from the constructor. */
    readonly result: Promise<FunctionLike<[], Traceable>>;
  };
}

/** Fired when `Object.defineProperty()` is used on the proxy. */
export interface ProxyDefinePropertyEvent extends ProxyEvent {
  readonly returnValue: void | PropertyDescriptor;
  readonly data: {
    /** Target object. */
    readonly target: Traceable;
    /** Property key being defined. */
    readonly property: ObjectKey;
    /** Property descriptor being applied. */
    readonly descriptor: PropertyDescriptor;
    /** Whether the definition succeeded. */
    readonly result: Promise<FunctionLike<[], boolean>>;
  };
}

/** Fired when a property is deleted from the proxy. */
export interface ProxyDeletePropertyEvent extends ProxyEvent {
  readonly returnValue: void;
  readonly data: {
    /** Target object. */
    readonly target: Traceable;
    /** Property key being deleted. */
    readonly property: ObjectKey;
    /** Whether the deletion succeeded. */
    readonly result: Promise<FunctionLike<[], boolean>>;
  };
}

/** Fired when a property is read from the proxy. */
export interface ProxyGetEvent extends ProxyEvent {
  readonly returnValue: unknown;
  readonly data: {
    /** Target object. */
    readonly target: Traceable;
    /** Property key being accessed. */
    readonly property: ObjectKey;
    /** Retrieved value. */
    readonly result: Promise<FunctionLike<[], unknown>>;
  };
}

/** Fired when property metadata is requested. */
export interface ProxyGetOwnPropertyDescriptorEvent extends ProxyEvent {
  readonly returnValue: void | PropertyDescriptor;
  readonly data: {
    /** Target object. */
    readonly target: Traceable;
    /** Property key being inspected. */
    readonly property: ObjectKey;
    /** Descriptor of the property. */
    readonly result: Promise<FunctionLike<[], PropertyDescriptor>>;
  };
}

/** Fired when a proxy's prototype is retrieved. */
export interface ProxyGetPrototypeOfEvent extends ProxyEvent {
  readonly returnValue: object;
  readonly data: {
    /** Target object. */
    readonly target: Traceable;
    /** Prototype of the target object. */
    readonly result: Promise<FunctionLike<[], object>>;
  };
}

/** Fired when the `in` operator is used on the proxy. */
export interface ProxyHasEvent extends ProxyEvent {
  readonly returnValue: boolean;
  readonly data: {
    /** Target object. */
    readonly target: Traceable;
    /** Property key checked for existence. */
    readonly property: ObjectKey;
    /** Whether the property exists. */
    readonly result: Promise<FunctionLike<[], boolean>>;
  };
}

/** Fired when checking if the proxy is extensible. */
export interface ProxyIsExtensibleEvent extends ProxyEvent {
  readonly returnValue: void | boolean;
  readonly data: {
    /** Target object. */
    readonly target: Traceable;
    /** Whether the object is extensible. */
    readonly result: Promise<FunctionLike<[], boolean>>;
  };
}

/** Fired when the proxy's own property keys are requested. */
export interface ProxyOwnKeysEvent extends ProxyEvent {
  readonly returnValue: ObjectKey[];
  readonly data: {
    /** Target object. */
    readonly target: Traceable;
    /** List of keys. */
    readonly result: Promise<FunctionLike<[], ObjectKey[]>>;
  };
}

/** Fired when `Object.preventExtensions()` is called on the proxy. */
export interface ProxyPreventExtensionsEvent extends ProxyEvent {
  readonly returnValue: void | boolean;
  readonly data: {
    /** Target object. */
    readonly target: Traceable;
    /** Whether preventing extensions succeeded. */
    readonly result: Promise<FunctionLike<[], boolean>>;
  };
}

/** Fired when a property is set on the proxy. */
export interface ProxySetEvent extends ProxyEvent {
  readonly returnValue: unknown;
  readonly data: {
    /** Target object. */
    readonly target: Traceable;
    /** Property key being set. */
    readonly property: ObjectKey;
    /** New value being assigned. */
    readonly value: unknown;
    /** Whether the set succeeded. */
    readonly result: Promise<FunctionLike<[], boolean>>;
  };
}

/** Fired when `Object.setPrototypeOf()` changes a proxy's prototype. */
export interface ProxySetPrototypeOfEvent extends ProxyEvent {
  readonly returnValue: void | object;
  readonly data: {
    /** Target object. */
    readonly target: Traceable;
    /** New prototype object. */
    readonly prototype: object;
    /** Whether the prototype change succeeded. */
    readonly result: Promise<FunctionLike<[], boolean>>;
  };
}

/** Fired when a new proxy instance is created. */
export interface ProxyCreateEvent extends ProxyEvent {
  readonly returnValue: void | Proxy;
  readonly data: {
    /** Unique proxy ID. */
    readonly id: string;
    /** Original proxy target. */
    readonly target: Traceable;
    /** Newly created proxy instance. */
    readonly result: Promise<FunctionLike<[], Proxy>>;
  };
}

/** Map of event names to data for {@link Nexo} events. */
export type NexoEvents = {
  proxy: {
    args: [ProxyCreateEvent];
    result: ProxyCreateEvent["returnValue"];
  };
  error: { args: [Error] };
};

/** Map of event names to data for {@link Nexo} and {@link ProxyWrapper} events. */
export type ProxyEvents = {
  error: { args: [Error] };
  "proxy.error": { args: [ProxyError] };
  "proxy.apply": {
    args: [ProxyApplyEvent];
    result: ProxyApplyEvent["returnValue"];
  };
  "proxy.construct": {
    args: [ProxyConstructEvent];
    result: ProxyConstructEvent["returnValue"];
  };
  "proxy.defineProperty": {
    args: [ProxyDefinePropertyEvent];
    result: ProxyDefinePropertyEvent["returnValue"];
  };
  "proxy.deleteProperty": {
    args: [ProxyDeletePropertyEvent];
    result: ProxyDeletePropertyEvent["returnValue"];
  };
  "proxy.get": {
    args: [ProxyGetEvent];
    result: ProxyGetEvent["returnValue"];
  };
  "proxy.getOwnPropertyDescriptor": {
    args: [ProxyGetOwnPropertyDescriptorEvent];
    result: ProxyGetOwnPropertyDescriptorEvent["returnValue"];
  };
  "proxy.getPrototypeOf": {
    args: [ProxyGetPrototypeOfEvent];
    result: ProxyGetPrototypeOfEvent["returnValue"];
  };
  "proxy.has": {
    args: [ProxyHasEvent];
    result: ProxyHasEvent["returnValue"];
  };
  "proxy.isExtensible": {
    args: [ProxyIsExtensibleEvent];
    result: ProxyIsExtensibleEvent["returnValue"];
  };
  "proxy.ownKeys": {
    args: [ProxyOwnKeysEvent];
    result: ProxyOwnKeysEvent["returnValue"];
  };
  "proxy.preventExtensions": {
    args: [ProxyPreventExtensionsEvent];
    result: ProxyPreventExtensionsEvent["returnValue"];
  };
  "proxy.set": {
    args: [ProxySetEvent];
    result: ProxySetEvent["returnValue"];
  };
  "proxy.setPrototypeOf": {
    args: [ProxySetPrototypeOfEvent];
    result: ProxySetPrototypeOfEvent["returnValue"];
  };
};
