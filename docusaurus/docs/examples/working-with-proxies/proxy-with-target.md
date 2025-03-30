---
title: Creating a proxy with target
hide_table_of_contents: false
---

## Using a target object

```javascript
import { Nexo } from "nexos";

const nexo = new Nexo();
const target = {};
const proxy = nexo.create(target);
```

## Using name references on proxys

```javascript
import { Nexo } from "nexos";

const nexo = new Nexo();
const target = {};
const proxy = nexo.use("foo", target);
const proxyByName = nexo.use("foo");

(proxy === proxyByName) === true; // true
```

## Updating a proxy target

```javascript
import { Nexo } from "nexos";

const nexo = new Nexo();
const foo = {};
const bar = {};

const fooProxy = nexo.use("foo", foo);
const barProxy = nexo.use("foo", bar);

const proxy = nexo.use("foo");

((fooProxy === barProxy) ===
  false(
    // true
    proxy === barProxy,
  )) ===
  true; // true
```
