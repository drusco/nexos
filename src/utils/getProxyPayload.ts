import Nexo from "../lib/types/Nexo.js";
import { NO_BREAK } from "../lib/constants.js";
import map from "../lib/maps.js";

const getProxyPayload = (proxy: Nexo.Proxy): string => {
  return NO_BREAK + map.proxies.get(proxy).id;
};

export default getProxyPayload;
