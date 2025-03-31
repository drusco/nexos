---
title: Proxy Errors
hide_table_of_contents: false
---

## Updating a Referenced Proxy

A proxy cannot be assigned multiple references. Attempting to use the same target under a different reference will throw a [ProxyError](../../api/classes/ProxyError).

```javascript
import { Nexo } from "nexos";

const nexo = new Nexo();
const target = {};
const proxy = nexo.use("foo", target);

// throws ProxyError
nexo.use("bar", target);
```
