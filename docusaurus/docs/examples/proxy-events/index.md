---
title: Proxy Events Reference
hide_table_of_contents: false
---

## Overview

Nexos emits fine-grained events for each JavaScript Proxy trap. These events allow you to observe and modify low-level behavior of objects and functions in real time — enabling powerful debugging, instrumentation, or dynamic behavior injection.

This page serves as a complete reference to all `proxy.*` events that can be listened to and handled within Nexos.

---

## Core Proxy Events

These are general-purpose proxy events that aren't tied to specific traps:

- [proxy](proxy.md) — Emitted whenever a new proxy is created.
- [proxy.error](../basics/error-handling.md#proxy-specific-errors) — Captures exceptions thrown during proxy operations.

## Proxy Trap Events

Each Proxy trap in JavaScript corresponds to a `proxy.*` event. You can hook into these to monitor or override behavior at a very granular level:

- [proxy.get](proxy.get.md)
- [proxy.set](proxy.set.md)
- [proxy.has](proxy.has.md)
- [proxy.apply](proxy.apply.md)
- [proxy.construct](proxy.construct.md)
- [proxy.ownKeys](proxy.ownKeys.md)
- [proxy.getOwnPropertyDescriptor](proxy.getOwnPropertyDescriptor.md)
- [proxy.defineProperty](proxy.defineProperty.md)
- [proxy.deleteProperty](proxy.deleteProperty.md)
- [proxy.getPrototypeOf](proxy.getPrototypeOf.md)
- [proxy.setPrototypeOf](proxy.setPrototypeOf.md)
- [proxy.isExtensible](proxy.isExtensible.md)
- [proxy.preventExtensions](proxy.preventExtensions.md)
