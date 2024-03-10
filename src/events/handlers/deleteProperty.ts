import Nexo from "../../types/Nexo.js";
import { map } from "../../utils/index.js";

const deleteProperty = (mock: Nexo.Mock, key: Nexo.objectKey): boolean => {
  const proxy = map.tracables.get(mock);
  const { sandbox } = map.proxies.get(proxy);

  // const origin: Nexo.proxy.origin.deleteProperty = {
  //   name: "deleteProperty",
  //   proxy,
  //   key,
  // };

  return sandbox.delete(key);
};

export default deleteProperty;
