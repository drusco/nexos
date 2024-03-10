import Nexo from "../../types/Nexo.js";
import { getTarget, isTraceable, map } from "../../utils/index.js";

const set = (mock: Nexo.Mock, key: Nexo.objectKey, value: unknown): boolean => {
  const proxy = map.tracables.get(mock);
  const { sandbox } = map.proxies.get(proxy);

  // const origin: Nexo.proxy.origin.set = {
  //   name: "set",
  //   proxy,
  //   key,
  //   value,
  // };

  const target = getTarget(value, true);

  if (isTraceable(target)) {
    sandbox.set(key, new WeakRef(target));
  } else {
    sandbox.set(key, target);
  }

  return true;
};

export default set;
