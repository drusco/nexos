import { EventEmitter } from "events";

declare namespace Emulator {
  interface EmulatorClass extends EventEmitter {}

  type bindString = (
    scope: EmulatorClass,
    id: string,
    target?: traceable,
  ) => functionLike;

  type bindTraceable = (
    scope: EmulatorClass,
    target: traceable,
    origin?: origin,
    groupId?: string,
  ) => functionLike;

  interface options {
    [x: string]: unknown;
  }

  interface group {
    length: number;
    rootItem: functionLike;
  }

  interface bindings {
    [id: string]: group;
  }

  interface private {
    options: options;
    bindings: bindings;
    itemCount: number;
    activeItems: number;
    groupCount: number;
  }

  interface origin {
    action: "get" | "set" | "construct" | "apply";
    item: unknown;
    key?: string;
    value?: unknown;
    that?: unknown;
    args?: unknown[];
  }

  interface item {
    id: number;
    dummy: functionLike;
    origin?: origin;
    target: traceable;
    revoke(): void;
    scope: EmulatorClass;
    sandbox: object;
    group?: string;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  type functionLike = Function;
  type traceable = object | functionLike;
}

export default Emulator;
