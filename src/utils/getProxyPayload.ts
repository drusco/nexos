import type nx from "../lib/types/Nexo.js";
import { PAYLOAD_PREFIX } from "../lib/constants.js";
import map from "../lib/maps.js";

const getProxyPayload = (proxy: nx.Proxy): string => {
  return PAYLOAD_PREFIX + map.proxies.get(proxy).id;
};

export default getProxyPayload;
