import Nexo from "../types/Nexo.js";
import constants from "./constants.js";
import map from "./map.js";

const getProxyPayload = (proxy: Nexo.Proxy): string => {
  return `${constants.NO_BREAK + map.proxies.get(proxy).id}`;
};

export default getProxyPayload;
