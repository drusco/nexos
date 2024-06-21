import type nx from "../types/Nexo.js";
import { PAYLOAD_PREFIX } from "./constants.js";
import map from "./maps.js";

const getProxyPayload = (proxy: nx.Proxy): string => {
  return PAYLOAD_PREFIX + map.proxies.get(proxy).id;
};

export default getProxyPayload;
