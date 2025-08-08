---
title: Quick Start
hide_table_of_contents: false
---

## Overview

Nexos extends JavaScript’s built-in `Proxy` by adding an event-driven layer that gives you more visibility and control over how proxies behave. Instead of writing custom handlers manually for each proxy, you can listen to lifecycle events and handler traps like `get`, `set`, `defineProperty`, and more — globally or per proxy.

This quick start guide demonstrates how to create proxies with Nexos and how to react to proxy events. We’ll start with a standard JavaScript proxy example, then explore how Nexos simplifies and enhances this process with event-driven functionality.

---

## 1. Standard JavaScript Proxy

The traditional way to intercept property access on an object:

```typescript
const target = { message: "Hello, world!" };
const handler = {
  get(target, property) {
    console.log(`Property '${property}' accessed.`);
    return target[property];
  },
};

const proxy = new Proxy(target, handler);
console.log(proxy.message); // Logs: Property 'message' accessed.
```

In this example, you must manually define the handler. Nexos removes that burden and gives you global access to proxy operations through events.

---

## 2. Nexos Proxy with Event Listener

Nexos lets you create a proxy and attach listeners to trap events like `get`, `set`, or even creation itself:

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();
const proxy = nexo.create({ message: "Hello, world!" });

nexo.on("proxy.get", (event: nx.ProxyGetEvent) => {
  console.log(`Property '${event.data.property}' accessed.`);
});

console.log(proxy.message); // Logs: Property 'message' accessed.
```

Here, `proxy.get` is emitted whenever a property is accessed, and we react to it through the listener.

---

## 3. Listening to Proxy Creation

Track whenever a new proxy is created — useful for logging, debugging, or assigning custom metadata:

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();

nexo.on("proxy", (event: ProxyCreateEvent) => {
  console.log("A new proxy has been created:", event.target);
});

const proxy = nexo.create({ key: "value" });
// Logs: A new proxy has been created: { key: "value" }
```

The event includes a unique proxy and its metadata.

---

## 4. Creating Virtual Proxies (No Target)

You can also create proxies without a real object behind them. Nexos handles operations using a sandbox:

```typescript
import { Nexo } from "nexos";

const nexo = new Nexo();
const virtualProxy = nexo.create();
virtualProxy.hello = "virtual";

console.log(virtualProxy.hello); // Prints: virtual
```

This is helpful for dynamic or placeholder objects where the structure is unknown at runtime.

---

## 5. Reacting to Property Changes

Let’s now intercept property assignments using the `"proxy.set"` event:

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();
const proxy = nexo.create({});

nexo.on("proxy.set", (event: nx.ProxySetEvent) => {
  console.log(`Setting property '${event.data.property}' to`, event.data.value);
});

proxy.name = "Nexos"; // Logs: Setting property 'name' to Nexos
```

This works globally for all proxies managed by the same `Nexo` instance.

---

## 🚀 Next Steps

- Dive into specific [proxy events](./examples/proxy-events)
- Learn how to [handle errors](./examples/basics/error-handling)
- Explore [more examples](./examples)

Nexos makes proxies more powerful, observable, and testable — perfect for building reactive systems, debugging, and dynamic API layers.
