import Exotic from "../types/Exotic.js";
import constants from "./constants.js";
import map from "./map.js";

const getProxyPayload = (proxy: Exotic.Proxy): string => {
  return `${constants.NO_BREAK + map.proxies.get(proxy).id}`;
};

export default getProxyPayload;
