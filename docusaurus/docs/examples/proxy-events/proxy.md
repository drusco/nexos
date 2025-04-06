---
title: proxy
hide_table_of_contents: false
---

This event is emitted whenever a new proxy is created. It can only be listened to from the `Nexo` class, not from individual proxies.

The event is of type [NexoEvent](/docs/api/classes/NexoEvent), which provides useful information about the created proxy instance.

### Data Properties

- **id** (`string`): A unique identifier for the proxy instance.
- **target?** ([Traceable](/docs/api/type-aliases/Traceable)): The underlying target object, if applicable. If the proxy was created without a target, this property may be `undefined`.

### Example Usage

```javascript
import { Nexo } from "nexos";

const nexo = new Nexo();
const proxy = nexo.create();

nexo.on("proxy", (event: NexoEvent) => {
    console.log(event.target); // prints the new proxy
});
```

In the example above, when a new proxy is created using `nexo.create()`, the `"proxy"` event is emitted. The event handler receives a `NexoEvent` containing details about the new proxy, such as its unique ID and optional target object.

This event is useful for tracking proxy instances, debugging, or implementing additional behaviors when new proxies are created.
