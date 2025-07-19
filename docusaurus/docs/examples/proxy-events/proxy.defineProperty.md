---
title: "proxy.defineProperty"
hide_table_of_contents: false
---

Type: [`ProxyDefinePropertyEvent`](../../api/interfaces/ProxyDefinePropertyEvent)

Triggered when `Object.defineProperty()` is called on the proxy to define or modify a property.

### Data Properties

#### target

[`Traceable`](../../api/type-aliases/Traceable)

The underlying target object.

#### property

[`ObjectKey`](../../api/type-aliases/ObjectKey.md)

The name or symbol of the property being defined or modified.

#### descriptor

`PropertyDescriptor`

A detailed description of the property, including its value and attributes such as `writable`, `configurable`, `enumerable`, `get`, and `set`. This mirrors the descriptor passed to `Object.defineProperty()`.

### Example

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();
const proxy = nexo.create();

nexo.on("proxy.defineProperty", (event: nx.ProxyDefinePropertyEvent) => {
  console.log(`Defining property: ${event.data.property}`);
});

Object.defineProperty(proxy, "enabled", {
  value: true,
  writable: false,
});
// Logs: Defining property: enabled
```
