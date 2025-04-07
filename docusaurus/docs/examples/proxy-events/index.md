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

- [proxy](proxy) — Emitted whenever a new proxy is created.
- [proxy.error](../basics/error-handling#proxy-specific-errors) — Captures exceptions thrown during proxy operations.

## Proxy Trap Events

Each Proxy trap in JavaScript corresponds to a `proxy.*` event. You can hook into these to monitor or override behavior at a very granular level:

- [proxy.get](proxy.get)
- [proxy.set](proxy.set)
- [proxy.has](proxy.has)
- [proxy.apply](proxy.apply)
- [proxy.construct](proxy.construct)
- [proxy.ownKeys](proxy.ownKeys)
- [proxy.getOwnPropertyDescriptor](proxy.getOwnPropertyDescriptor)
- [proxy.defineProperty](proxy.defineProperty)
- [proxy.deleteProperty](proxy.deleteProperty)
- [proxy.getPrototypeOf](proxy.getPrototypeOf)
- [proxy.setPrototypeOf](proxy.setPrototypeOf)
- [proxy.isExtensible](proxy.isExtensible)
- [proxy.preventExtensions](proxy.preventExtensions)
