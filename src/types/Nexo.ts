/* eslint-disable @typescript-eslint/no-explicit-any */

export type ArrayLike = unknown[];
export type Traceable = NonNullable<object | FunctionLike>;
export type ObjectKey = string | symbol;
export type PlainObject = Record<ObjectKey, unknown>;
export type VoidFunction = (...args: ArrayLike) => void;
export type FunctionLike<
  Args extends ArrayLike = ArrayLike,
  Return = unknown,
> = (...args: Args) => Return;
export type Constructable<T> = new (...args: ArrayLike) => T;
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

export interface Proxy {
  new <Return extends Traceable = Proxy, Args extends ArrayLike = ArrayLike>(
    ...args: Args
  ): Return;
  <Return = Proxy, Args extends ArrayLike = ArrayLike>(...args: Args): Return;
  name: any;
  apply: any;
  arguments: any;
  bind: any;
  call: any;
  caller: any;
  length: any;
  prototype: any;
  toString: any;
  [key: ObjectKey]: any;
}

export interface NexoEvent<Target, Data> {
  readonly name: string;
  readonly data: Data;
  readonly target: Target;
  readonly timestamp: number;
  readonly cancelable: boolean;
  readonly defaultPrevented: boolean;
  returnValue: unknown;
  preventDefault(): void;
}

export interface ProxyEvent<Data = unknown> extends NexoEvent<Proxy, Data> {}
export interface ProxyApplyEvent
  extends ProxyEvent<{
    target: FunctionLike;
    thisArg: unknown;
    args: ArrayLike;
    result?: Proxy;
  }> {}

export interface ProxyConstructEvent
  extends ProxyEvent<{
    target: FunctionLike;
    args: ArrayLike;
    result?: Proxy;
  }> {
  returnValue: object;
}

export interface ProxyDefinePropertyEvent
  extends ProxyEvent<{
    target: Traceable;
    property: ObjectKey;
    descriptor: PropertyDescriptor;
  }> {}

export interface ProxyDeletePropertyEvent
  extends ProxyEvent<{
    target: Traceable;
    property: ObjectKey;
  }> {}

export interface ProxyGetEvent
  extends ProxyEvent<{
    target: Traceable;
    property: ObjectKey;
    result: unknown;
  }> {}

export interface ProxyGetOwnPropertyDescriptorEvent
  extends ProxyEvent<{
    target: Traceable;
    property: ObjectKey;
    descriptor: PropertyDescriptor;
  }> {}

export interface ProxyGetPrototypeOfEvent
  extends ProxyEvent<{
    target: Traceable;
    result: object;
  }> {}

export interface ProxyHasEvent
  extends ProxyEvent<{
    target: Traceable;
    property: ObjectKey;
    result: boolean;
  }> {}

export interface ProxyIsExtensibleEvent
  extends ProxyEvent<{
    target: Traceable;
    result: boolean;
  }> {}

export interface ProxyOwnKeysEvent
  extends ProxyEvent<{
    target: Traceable;
    result: ObjectKey[];
  }> {}

export interface ProxyPreventExtensionsEvent
  extends ProxyEvent<{
    target: Traceable;
    result: boolean;
  }> {}

export interface ProxySetEvent
  extends ProxyEvent<{
    target: Traceable;
    property: ObjectKey;
    value: unknown;
  }> {}

export interface ProxySetPrototypeOfEvent
  extends ProxyEvent<{
    target: Traceable;
    prototype: object;
  }> {
  returnValue: object;
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
