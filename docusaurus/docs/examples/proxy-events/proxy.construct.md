---
title: "proxy.construct"
hide_table_of_contents: false
---

Type: [`ProxyConstructEvent`](../../api/interfaces/ProxyConstructEvent)

Fired when a proxy-wrapped constructor is called using the `new` keyword.

> This event is **cancelable**, meaning its default behavior can be prevented.
> By calling `event.preventDefault()`, you can override or block the underlying operation.
> This allows you to intercept and customize how the proxy responds to this operation.

### Data Properties

#### target

[`FunctionLike`](../../api/type-aliases/FunctionLike)

The underlying target function.

#### args

[`ArrayLike`](../../api/type-aliases/ArrayLike)

The list of arguments passed to the constructor.

#### result

[`Traceable`](../../api/type-aliases/Traceable)

The object returned by the constructor. If the event is not canceled, the result is not overridden, and the proxy was created without a target, this will typically be a newly created proxy instance.

### Example

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();
const proxy = nexo.create(Person);

function Person(name) {
  this.name = name;
}

nexo.on("proxy.construct", (event: nx.ProxyConstructEvent) => {
  console.log("Constructor called with:", event.data.args);
});

new proxy("Alice"); // Logs: Constructor called with: [ 'Alice' ]
```
