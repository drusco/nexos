---
title: Quick Start
hide_table_of_contents: false
---

Nexos extends JavaScript's built-in Proxy to provide enhanced event-driven capabilities. This guide will walk you through creating a basic proxy in JavaScript and then demonstrate how to achieve the same functionality using Nexos, along with event listening for proxy creation and property access.

## Standard Javascript Proxy

```javascript
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

## Nexos Proxy

With Nexos, we can achieve the same but with event-driven control:

```javascript
import { Nexo } from "nexos";

const nexo = new Nexo();
const proxy = nexo.create({ message: "Hello, world!" });

nexo.on("proxy.get", (event) => {
  console.log(`Property '${event.data.property}' accessed.`);
});

console.log(proxy.message); // Logs: Property 'message' accessed.
```

## Listening to Proxy Creation

You can listen to the creation of proxies with the `proxy` event:

```javascript
nexo.on("proxy", (event) => {
  console.log("A new proxy has been created:", event.target);
});

const proxy = nexo.create({ key: "value" });
// Logs: A new proxy has been created: { key: "value" }
```

## Next Steps

For an extensive list of examples, follow this link: [Nexos Examples](examples)
