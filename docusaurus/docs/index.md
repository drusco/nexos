---
title: Introduction
hide_table_of_contents: false
---

## Overview

**Nexos** introduces support for the creation of ES6 proxies with or without a target object. Proxy handlers can be dynamically accessed through listeners attached either to a nexo instance or to individual proxy wrappers. Each proxy event follows the naming convention `"proxy.handlerName"`, where `handlerName` corresponds to one of the standard handler functions specified in the [MDN Proxy API documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy). For example, events such as `"proxy.apply"`, `"proxy.construct"`, and others will be emitted when the corresponding handler functions (`apply`, `construct`, etc.) are invoked.

## Features

- **Unique ID assignment**: Automatically generates a unique ID for each proxy, allowing for easy retrieval and management.
- **Target flexibility**: Proxies can be created with or without a target, supporting both virtual and real objects.
- **Sandbox support**: When no target is provided, the proxy interacts with a sandbox object, isolating property descriptors and operations.
- **Weak reference tracking**: Uses WeakRef to store proxy objects, ensuring efficient memory management by allowing garbage collection when proxies are no longer in use.
- **Event emission**: Emits events for every key proxy operation, including creation, handler functions for proxy traps (like get, set, defineProperty), proxy errors, and general errors, providing full monitoring and control over all proxy-related activities.
