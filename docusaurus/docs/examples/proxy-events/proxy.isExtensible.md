---
title: "proxy.isExtensible"
hide_table_of_contents: false
---

Fired when checking if new properties can be added to the proxy.

```javascript
const proxy = nexo.create({});

nexo.on("proxy.isExtensible", () => {
  console.log("Checking extensibility");
});

Object.isExtensible(proxy); // Logs: Checking extensibility
```
