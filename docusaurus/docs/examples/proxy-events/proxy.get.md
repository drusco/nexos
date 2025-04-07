---
title: "proxy.get"
hide_table_of_contents: false
---

Type: [`ProxyEvent`](/docs/api/classes/ProxyEvent)

Fired when a property is accessed on a proxy object.

```javascript
const proxy = nexo.create({ greeting: "hello" });

nexo.on("proxy.get", (event) => {
  console.log(`Accessed property: ${event.data.property}`);
});

console.log(proxy.greeting); // Logs: Accessed property: greeting
```
