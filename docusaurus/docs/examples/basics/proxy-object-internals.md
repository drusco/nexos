---
title: Proxy Internals
hide_table_of_contents: false
---

## Property Descriptors

### With a Target

You can retrieve the own property descriptor of a proxy when it wraps a target object. The descriptor should match the original object's descriptor.

```typescript
import { Nexo } from "nexos";

const nexo = new Nexo();
const target = { foo: "example" };
const proxy = nexo.create(target);
const descriptor = Nexo.getOwnPropertyDescriptor(proxy, "foo");

// prints true
console.log(descriptor === Object.getOwnPropertyDescriptor(target, "foo"));
```

### Without a Target

If the proxy does not wrap a target, attempting to retrieve a property descriptor will return `undefined`.

```typescript
import { Nexo } from "nexos";

const nexo = new Nexo();
const proxy = nexo.create();
const descriptor = Nexo.getOwnPropertyDescriptor(proxy, "foo");

// prints true
console.log(descriptor === undefined);
```

---

## Retrieving Keys

### Empty Proxy

A proxy without an underlying target has no own properties, so retrieving its keys returns an empty array.

```typescript
import { Nexo } from "nexos";

const nexo = new Nexo();
const proxy = nexo.create();
const emptyKeys = Nexo.ownKeys(proxy);

console.log(emptyKeys); // prints []
```

### Proxy with Target

If the proxy wraps an object, it returns the keys of that object.

```typescript
import { Nexo } from "nexos";

const nexo = new Nexo();
const proxyWithTarget = nexo.create({ foo: true, bar: true, baz: true });
const targetKeys = Nexo.ownKeys(proxyWithTarget);

console.log(targetKeys); // prints ["foo", "bar", "baz"]
```

---

## Tracking New Properties

Properties added directly to a proxy after its creation will appear when retrieving its own keys.

```typescript
import { Nexo } from "nexos";

const nexo = new Nexo();
const proxy = nexo.create();

proxy.foo = true;
const keys = Nexo.ownKeys(proxy);

console.log(keys); // prints ["foo"]
```

---

## Proxy Prototypes

You can retrieve the prototype of a proxy. If the proxy is created without a target, its prototype is `null`. Otherwise, it inherits from the target's prototype.

```typescript
import { Nexo } from "nexos";

const nexo = new Nexo();
const proxy = nexo.create();
const proxyArray = nexo.create([]);

console.log(Nexo.getPrototypeOf(proxy)); // prints null
console.log(Nexo.getPrototypeOf(proxyArray)); // prints Array.prototype
```
