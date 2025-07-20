---
title: Error Handling
hide_table_of_contents: false
---

## General Errors

General errors are emitted under the `"error"` event and **do not originate from proxy handler traps**. These are standard [Error Objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) raised when something goes wrong within Nexos' internal logic — such as invalid method usage, listener failures, or other non-proxy runtime exceptions.

These events are useful for monitoring the general health of your application’s interaction with Nexos, especially when integrating it into complex dynamic systems.

You can listen to these errors globally through the `nexo` instance.

```typescript
import { Nexo } from "nexos";

const nexo = new Nexo();

nexo.on("error", (error) => {
  console.log("Global error from Nexo:", error.message);
});
```

---

## Proxy-Specific Errors

Emits a custom [ProxyError](../../api/classes/ProxyError) when an issue arises directly from a proxy operation.

These are special error instances thrown during lifecycle operations that Nexos manages, such as:

- Performing invalid operations on a frozen or sealed proxy
- Failing to define a property due to descriptor conflicts
- Misusing a proxy that was already disconnected or replaced

Each `ProxyError` includes rich metadata to help you trace which proxy, name, or target was involved. You can listen to these errors globally (`nexo.on`) or individually on the proxy wrapper (`wrapper.on`), allowing fine-grained error handling for complex systems.

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();
const proxy = nexo.create();
const wrapper = Nexo.wrap(proxy);

wrapper.on("proxy.error", (error: nx.ProxyError) => {
  console.warn("Proxy-level error:", error.message);
});

nexo.on("proxy.error", (error: nx.ProxyError) => {
  console.warn("Global proxy error:", error.message);
});
```

With these listeners in place, Nexos makes it easier to isolate, debug, and recover from issues that arise during dynamic proxy handling.
