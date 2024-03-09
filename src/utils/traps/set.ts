import Nexo from "../../types/Nexo.js";
import getTarget from "../getTarget.js";
import isTraceable from "../isTraceable.js";
import map from "../map.js";

const set = (mock: Nexo.Mock, key: Nexo.objectKey, value: unknown): boolean => {
  const proxy = map.tracables.get(mock);
  const { sandbox } = map.proxies.get(proxy);

  // const origin: Nexo.proxy.origin.set = {
  //   name: "set",
  //   proxy,
  //   key,
  //   value,
  // };

  const target = getTarget(value);

  sandbox.set(key, isTraceable(target) ? new WeakRef(target) : target);

  return true;
};

export default set;
