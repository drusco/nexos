/* eslint-disable @typescript-eslint/no-explicit-any */

export type ArrayLike = unknown[];
export type Traceable = NonNullable<object>;
export type ObjectKey = string | symbol;
export type PlainObject = Record<ObjectKey, unknown>;
export type VoidFunction = (...args: ArrayLike) => void;
export type FunctionLike = (...args: ArrayLike) => any;
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

export interface Proxy extends FunctionLike {
  new (...args: ArrayLike): any;
  [x: ObjectKey]: any;
  name: any;
  apply: any;
  arguments: any;
  bind: any;
  call: any;
  caller: any;
  length: any;
  prototype: any;
  toString: any;
}

export interface Event<Target, Data> {
  target?: Target;
  data?: Data;
  cancelable?: boolean;
}
