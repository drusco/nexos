---
title: "proxy.set"
hide_table_of_contents: false
---

Fired when a property value is set.

```javascript
const proxy = nexo.create({});

nexo.on("proxy.set", (event) => {
  console.log(`Set ${event.data.property} = ${event.data.value}`);
});

proxy.name = "Nexos"; // Logs: Set name = Nexos
```
