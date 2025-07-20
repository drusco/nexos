---
title: "proxy.apply"
hide_table_of_contents: false
---

Type: [`ProxyApplyEvent`](../../api/interfaces/ProxyApplyEvent)

Fired when a proxy-wrapped function is invoked.

> This event is **cancelable**, meaning its default behavior can be prevented.
> By calling `event.preventDefault()`, you can override or block the underlying operation.
> This allows you to intercept and customize how the proxy responds to this operation.

### Data Properties

#### target

[`FunctionLike`](../../api/type-aliases/FunctionLike)

The underlying target function.

#### args

[`ArrayLike`](../../api/type-aliases/ArrayLike)

The arguments passed to the function during the call.

#### thisArg

`unknown`

The value of `this` used during the function call.
It represents the context in which the proxy-wrapped function is invoked.

#### result

`unknown`

The value returned by the function. If the event is not canceled, the result is not overridden, and the proxy was created without a target, this will typically be a newly created proxy instance.

### Example

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();
const proxy = nexo.create(() => "called!");

nexo.on("proxy.apply", (event: nx.ProxyApplyEvent) => {
  console.log("Function called with:", event.data.args);
});

proxy(1, 2); // Logs: Function called with: [1, 2]
```
