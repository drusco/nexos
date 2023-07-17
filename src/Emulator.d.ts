import { EventEmitter } from "events";

declare namespace Emulator {
  interface EmulatorClass extends EventEmitter {}

  interface options {
    [x: string]: unknown;
  }

  interface private {
    options: options;
    groups: groups;
    itemCount: number;
    activeItems: number;
    groupCount: number;
  }

  interface group {
    length: number;
    rootItem: unknown;
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

  type functionLike = (...args: unknown[]) => unknown;
  type traceable = object | functionLike;
  type groups = Record<string, group>;
}

export default Emulator;
