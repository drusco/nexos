import { EventEmitter } from "events";

declare namespace Emulator {
  interface EmulatorClass extends EventEmitter {}

  interface options {
    [x: string]: unknown;
  }

  interface group {
    length: number;
    rootItem: functionLike;
  }

  interface groups {
    [id: string]: group;
  }

  interface private {
    options: options;
    groups: groups;
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
    origin: origin;
    target: traceable;
    revoke(): void;
    scope: EmulatorClass;
    sandbox: object;
    group: string | undefined;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  type functionLike = Function;
  type traceable = object | functionLike;
}

export default Emulator;
