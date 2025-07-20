---
title: "proxy.setPrototypeOf"
hide_table_of_contents: false
---

Type: [`ProxySetPrototypeOfEvent`](../../api/interfaces/ProxySetPrototypeOfEvent)

Fired when changing the prototype with `Object.setPrototypeOf`.

> This event is **cancelable**, meaning its default behavior can be prevented.
> By calling `event.preventDefault()`, you can override or block the underlying operation.
> This allows you to intercept and customize how the proxy responds to this operation.

### Data Properties

#### target

[`Traceable`](../../api/type-aliases/Traceable)

The underlying target object.

#### prototype

`object`

The new prototype object that is being assigned to the proxy’s target.

### Example

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();
const proxy = nexo.create({});
const proto = { kind: "custom" };

nexo.on("proxy.setPrototypeOf", (event: nx.ProxySetPrototypeOfEvent) => {
  console.log("Prototype being changed");
});

Object.setPrototypeOf(proxy, proto); // Logs: Prototype being changed
```
