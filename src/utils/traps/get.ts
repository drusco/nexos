import Nexo from "../../types/Nexo.js";
import getProxy from "../getProxy.js";
import getTarget from "../getTarget.js";
import isTraceable from "../isTraceable.js";
import map from "../map.js";

const get = (mock: Nexo.Mock, key: Nexo.objectKey): unknown => {
  const proxy = map.tracables.get(mock);
  const { scope, target, sandbox } = map.proxies.get(proxy);

  // const origin: Nexo.proxy.origin.get = {
  //   name: "get",
  //   proxy,
  //   key,
  // };

  if (sandbox.has(key)) {
    return getTarget(sandbox.get(key), true);
  }

  let value: unknown;
  const proxyTarget = getTarget(target);

  // try getting the value from the original target
  // catch when the target is untraceable
  try {
    value = proxyTarget[key];
  } catch (error) {
    // empty
  }

  if (!isTraceable(value)) {
    return value;
  }

  return getProxy(scope.deref(), value);
};

export default get;
