---
title: "proxy.has"
hide_table_of_contents: false
---

Triggered when the `in` operator is used.

```javascript
const proxy = nexo.create({ loaded: true });

nexo.on("proxy.has", (event) => {
  console.log(`Checking if '${event.data.property}' exists`);
});

console.log("loaded" in proxy); // Logs: Checking if 'loaded' exists
```
