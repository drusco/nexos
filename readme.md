![npm](https://img.shields.io/npm/v/nexo-proxy.svg) ![release](https://img.shields.io/github/actions/workflow/status/drusco/nexo/ci.yml?branch=main&event=push) [![codecov](https://codecov.io/gh/drusco/nexo-proxy/graph/badge.svg?token=ALMIPSLT4U)](https://codecov.io/gh/drusco/nexo-proxy)

## nexo-proxy

This library introduces support for the creation of ES6 proxies with or without a target object. Proxy handlers can be dynamically accessed through listeners attached either to the Nexo instance or to individual proxy wrappers. Each proxy event follows the naming convention `"proxy.handlerName"`, where `handlerName` corresponds to one of the standard handler functions specified in the [MDN Proxy API documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy). For example, events such as `"proxy.apply"`, `"proxy.construct"`, and others will be emitted when the corresponding handler functions (`apply`, `construct`, etc.) are invoked.

This structure allows developers to observe and intercept various proxy operations at runtime, offering flexibility in managing behaviors such as function invocation, object construction, property access, and more. Whether you are working with a proxy that wraps an existing target or creating a handler for an undefined target, the event-driven design of this librar simplifies the management of complex proxy behaviors.

### Requirements

**node** >= v16.20.2  
**npm** >= v8.19.4

### License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2024 Pedro Gallardo
