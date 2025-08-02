/* eslint-disable @typescript-eslint/no-explicit-any */

//** Types

export type ArrayLike = unknown[];
export type Traceable = NonNullable<object | FunctionLike>;
export type ObjectKey = string | symbol;
export type PlainObject = Record<ObjectKey, unknown>;
export type FunctionLike<
  Args extends ArrayLike = ArrayLike,
  Return = unknown,
> = (...args: Args) => Return;
export type resolveProxy = () => [Proxy, ProxyWrapper];
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

//** Interfaces

export interface NexoMap<Target extends Traceable>
  extends Map<string, WeakRef<Target>> {
  readonly events: NexoEmitter;
  set(key: string, value: WeakRef<Target>): this;
  release(): void;
}

export interface NexoEvent<Target = unknown, Data = unknown> {
  readonly name: string;
  readonly data: Data;
  readonly target: Target;
  readonly timestamp: number;
  readonly cancelable: boolean;
  readonly defaultPrevented: boolean;
  returnValue: unknown;
  preventDefault(): void;
}

export interface NexoEmitter {
  on(event: ObjectKey, listener: FunctionLike): this;
  off(event: ObjectKey, listener: FunctionLike): this;
  emit<Event extends NexoEvent>(
    eventName: ObjectKey,
    data: Event | Error,
  ): boolean;
}

export interface Nexo extends NexoEmitter {
  readonly entries: NexoMap<Proxy>;
  use(id: string, target?: Traceable): Proxy;
  create(target?: Traceable): Proxy;
}

export interface Proxy {
  new <Return extends Traceable = Proxy, Args extends ArrayLike = ArrayLike>(
    ...args: Args
  ): Return;
  <Return = Proxy, Args extends ArrayLike = ArrayLike>(...args: Args): Return;
  name: any;
  apply: any;
  bind: any;
  call: any;
  caller: any;
  length: any;
  toString: any;
  [key: ObjectKey]: any;
}

export interface ProxyWrapper extends NexoEmitter {
  readonly id: string;
  readonly nexo: Nexo;
  readonly traceable: boolean;
  readonly sandbox: void | Traceable;
  readonly revoked: boolean;
  revoke(): void;
}

export interface ProxyError extends Error {
  readonly proxy: Proxy;
  readonly name: "ProxyError";
}

export interface ProxyEvent<Data = unknown> extends NexoEvent<Proxy, Data> {
  readonly returnValue: unknown;
}

export interface ProxyApplyEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly thisArg: unknown;
    readonly args: ArrayLike;
    readonly result: Promise<FunctionLike<[], unknown>>;
  }> {
  readonly cancelable: true;
}

export interface ProxyConstructEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly args: ArrayLike;
    readonly result: Promise<FunctionLike<[], object>>;
  }> {
  readonly cancelable: true;
}

export interface ProxyDefinePropertyEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly property: ObjectKey;
    readonly descriptor: PropertyDescriptor;
    readonly result: Promise<FunctionLike<[], boolean>>;
  }> {
  readonly cancelable: true;
}

export interface ProxyDeletePropertyEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly property: ObjectKey;
    readonly result: Promise<FunctionLike<[], boolean>>;
  }> {
  readonly cancelable: true;
}

export interface ProxyGetEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly property: ObjectKey;
    readonly result: Promise<FunctionLike<[], unknown>>;
  }> {
  readonly cancelable: true;
}

export interface ProxyGetOwnPropertyDescriptorEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly property: ObjectKey;
    readonly result: Promise<FunctionLike<[], PropertyDescriptor>>;
  }> {
  readonly cancelable: true;
}

export interface ProxyGetPrototypeOfEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly result: Promise<FunctionLike<[], object>>;
  }> {
  readonly cancelable: true;
}

export interface ProxyHasEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly property: ObjectKey;
    readonly result: Promise<FunctionLike<[], boolean>>;
  }> {
  readonly cancelable: true;
}

export interface ProxyIsExtensibleEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly result: Promise<FunctionLike<[], boolean>>;
  }> {
  readonly cancelable: true;
}

export interface ProxyOwnKeysEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly result: Promise<FunctionLike<[], ObjectKey[]>>;
  }> {
  readonly cancelable: true;
}

export interface ProxyPreventExtensionsEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly result: Promise<FunctionLike<[], boolean>>;
  }> {
  readonly cancelable: true;
}

export interface ProxySetEvent
  extends ProxyEvent<{
    target: Traceable;
    property: ObjectKey;
    value: unknown;
  }> {
  readonly cancelable: true;
}

export interface ProxySetPrototypeOfEvent
  extends ProxyEvent<{
    target: Traceable;
    prototype: object;
  }> {
  readonly cancelable: true;
}

export interface ProxyCreateEvent
  extends ProxyEvent<{ id: string; target?: Traceable }> {}

export interface ProxyEvents {
  proxy: ProxyCreateEvent;
  "proxy.apply": ProxyApplyEvent;
  "proxy.construct": ProxyConstructEvent;
  "proxy.defineProperty": ProxyDefinePropertyEvent;
  "proxy.deleteProperty": ProxyDeletePropertyEvent;
  "proxy.get": ProxyGetEvent;
  "proxy.getOwnPropertyDescriptor": ProxyGetOwnPropertyDescriptorEvent;
  "proxy.getPrototypeOf": ProxyGetPrototypeOfEvent;
  "proxy.has": ProxyHasEvent;
  "proxy.isExtensible": ProxyIsExtensibleEvent;
  "proxy.ownKeys": ProxyOwnKeysEvent;
  "proxy.preventExtensions": ProxyPreventExtensionsEvent;
  "proxy.set": ProxySetEvent;
  "proxy.setPrototypeOf": ProxySetPrototypeOfEvent;
}
