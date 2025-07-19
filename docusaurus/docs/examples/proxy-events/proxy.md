---
title: proxy
hide_table_of_contents: false
---

Type: [`ProxyCreateEvent`](../../api/interfaces/ProxyCreateEvent)

This event is emitted whenever a new proxy is created. It can only be listened to from the `Nexo` class, not from individual proxies. It provides useful information about the created proxy instance.

### Data Properties

#### target

[`Traceable`](../../api/type-aliases/Traceable)

The underlying target object, if applicable. If the proxy was created without a target, this property may be `undefined`.

#### id

`string`

A unique identifier for the proxy instance.

### Example

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();

nexo.on("proxy", (event: nx.ProxyCreateEvent) => {
  console.log(event.target); // prints the new proxy
});

const proxy = nexo.create();
```

In the example above, when a new proxy is created using `nexo.create()`, the `"proxy"` event is emitted. The event handler receives a `ProxyCreateEvent` containing details about the new proxy, such as its unique ID and optional target object.

This event is useful for tracking proxy instances, debugging, or implementing additional behaviors when new proxies are created.
