export type ArrayLike = unknown[];
export type Traceable = NonNullable<object | FunctionLike>;
export type ObjectKey = string | symbol;
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
  on(event: string, listener: FunctionLike): this;
  off(event: string, listener: FunctionLike): this;
  emit(event: string, data: unknown): boolean;
}

export interface Nexo extends NexoEmitter {
  readonly entries: NexoMap<Proxy>;
  use(id: string, target?: Traceable): Proxy;
  create(target?: Traceable): Proxy;
}

export interface Proxy {
  new <Args extends ArrayLike = ArrayLike, Return extends Traceable = Proxy>(
    ...args: Args
  ): Return;
  <Args extends ArrayLike = ArrayLike, Return = Proxy>(...args: Args): Return;
  name: unknown;
  apply: unknown;
  bind: unknown;
  call: unknown;
  caller: unknown;
  length: unknown;
  toString: unknown;
  [key: ObjectKey]: unknown;
}

export interface ProxyWrapper extends NexoEmitter {
  readonly id: string;
  readonly nexo: Nexo;
  readonly sandbox: void | Traceable;
  readonly revoked: boolean;
  revoke(): void;
}

export interface ProxyError extends Error {
  readonly proxy: Proxy;
  readonly name: "ProxyError";
}

export interface ProxyEvent<Data = unknown> extends NexoEvent<Proxy, Data> {
  readonly returnValue: void | unknown;
  readonly cancelable: true;
}

export interface ProxyApplyEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly thisArg: unknown;
    readonly args: ArrayLike;
    readonly result: Promise<FunctionLike<[], unknown>>;
  }> {
  readonly returnValue: void | unknown;
}

export interface ProxyConstructEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly args: ArrayLike;
    readonly result: Promise<FunctionLike<[], object>>;
  }> {
  readonly returnValue: void | object;
}

export interface ProxyDefinePropertyEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly property: ObjectKey;
    readonly descriptor: PropertyDescriptor;
    readonly result: Promise<FunctionLike<[], boolean>>;
  }> {
  readonly returnValue: void | PropertyDescriptor;
}

export interface ProxyDeletePropertyEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly property: ObjectKey;
    readonly result: Promise<FunctionLike<[], boolean>>;
  }> {
  readonly returnValue: void | boolean;
}

export interface ProxyGetEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly property: ObjectKey;
    readonly result: Promise<FunctionLike<[], unknown>>;
  }> {
  readonly returnValue: void | unknown;
}

export interface ProxyGetOwnPropertyDescriptorEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly property: ObjectKey;
    readonly result: Promise<FunctionLike<[], PropertyDescriptor>>;
  }> {
  readonly returnValue: void | PropertyDescriptor;
}

export interface ProxyGetPrototypeOfEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly result: Promise<FunctionLike<[], object>>;
  }> {
  readonly returnValue: void | object;
}

export interface ProxyHasEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly property: ObjectKey;
    readonly result: Promise<FunctionLike<[], boolean>>;
  }> {
  readonly returnValue: void | boolean;
}

export interface ProxyIsExtensibleEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly result: Promise<FunctionLike<[], boolean>>;
  }> {
  readonly returnValue: void | boolean;
}

export interface ProxyOwnKeysEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly result: Promise<FunctionLike<[], ObjectKey[]>>;
  }> {
  readonly returnValue: void | ObjectKey[];
}

export interface ProxyPreventExtensionsEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly result: Promise<FunctionLike<[], boolean>>;
  }> {
  readonly returnValue: void | boolean;
}

export interface ProxySetEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly property: ObjectKey;
    readonly value: unknown;
    readonly result: Promise<FunctionLike<[], boolean>>;
  }> {
  readonly returnValue: void | boolean;
}

export interface ProxySetPrototypeOfEvent
  extends ProxyEvent<{
    readonly target: Traceable;
    readonly prototype: object;
    readonly result: Promise<FunctionLike<[], boolean>>;
  }> {
  readonly returnValue: void | object;
}

export interface ProxyCreateEvent
  extends NexoEvent<
    Proxy,
    {
      readonly id: string;
      readonly target?: Traceable;
    }
  > {
  readonly returnValue: void | Proxy;
}

export interface NexoEmitterEvents {
  error: Error;
}

export interface NexoMapEvents extends NexoEmitterEvents {
  set: NexoEvent;
  delete: NexoEvent;
  clear: NexoEvent;
  release: NexoEvent;
}

export interface NexoEvents extends NexoEmitterEvents {
  proxy: ProxyCreateEvent;
}
export interface ProxyEvents extends NexoEmitterEvents {
  "proxy.error": ProxyError;
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
