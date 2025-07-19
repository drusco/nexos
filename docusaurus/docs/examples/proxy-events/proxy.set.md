---
title: "proxy.set"
hide_table_of_contents: false
---

Type: [`ProxySetEvent`](../../api/interfaces/ProxySetEvent)

Triggered when a value is assigned to a property on the proxy.

> This event is **cancelable**, meaning its default behavior can be prevented.
> By calling `event.preventDefault()`, you can override or block the underlying operation.
> This allows you to intercept and customize how the proxy responds to this operation.

### Data Properties

#### target

[`Traceable`](../../api/type-aliases/Traceable)

The underlying target object.

#### property

[`ObjectKey`](../../api/type-aliases/ObjectKey)

The name or symbol of the property being accessed on the object.

#### value

`unknown`

The new value being assigned to the specified property on the proxy.

### Example

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();
const proxy = nexo.create({});

nexo.on("proxy.set", (event: nx.ProxySetEvent) => {
  console.log(`Set ${event.data.property} = ${event.data.value}`);
});

proxy.name = "Nexos"; // Logs: Set name = Nexos
```
