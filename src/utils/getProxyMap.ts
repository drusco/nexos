const proxyMap = new WeakMap();

export default function getProxyMap(): WeakMap<nx.Proxy, nx.ProxyWrapper> {
  return proxyMap;
}
