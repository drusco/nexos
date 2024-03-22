import Nexo from "../lib/types/Nexo.js";
import { PAYLOAD_PREFIX } from "../lib/constants.js";
import map from "../lib/maps.js";

const getProxyPayload = (proxy: Nexo.Proxy): string => {
  return PAYLOAD_PREFIX + map.proxies.get(proxy).id;
};

export default getProxyPayload;
