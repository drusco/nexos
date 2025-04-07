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

- [proxy](/docs/examples/proxy-events/proxy) — Emitted whenever a new proxy is created.
- [proxy.error](/docs/examples/basics/error-handling) — Captures exceptions thrown during proxy operations.

## Proxy Trap Events

Each Proxy trap in JavaScript corresponds to a `proxy.*` event. You can hook into these to monitor or override behavior at a very granular level:

- [proxy.get](/docs/examples/proxy-events/proxy.get)
- [proxy.set](/docs/examples/proxy-events/proxy.set)
- [proxy.has](/docs/examples/proxy-events/proxy.has)
- [proxy.apply](/docs/examples/proxy-events/proxy.apply)
- [proxy.construct](/docs/examples/proxy-events/proxy.construct)
- [proxy.ownKeys](/docs/examples/proxy-events/proxy.ownKeys)
- [proxy.getOwnPropertyDescriptor](/docs/examples/proxy-events/proxy.getOwnPropertyDescriptor)
- [proxy.defineProperty](/docs/examples/proxy-events/proxy.defineProperty)
- [proxy.deleteProperty](/docs/examples/proxy-events/proxy.deleteProperty)
- [proxy.getPrototypeOf](/docs/examples/proxy-events/proxy.getPrototypeOf)
- [proxy.setPrototypeOf](/docs/examples/proxy-events/proxy.setPrototypeOf)
- [proxy.isExtensible](/docs/examples/proxy-events/proxy.isExtensible)
- [proxy.preventExtensions](/docs/examples/proxy-events/proxy.preventExtensions)
