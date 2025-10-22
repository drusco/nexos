const proxyMap = new WeakMap();

export default function getProxyMap(): WeakMap<nx.Traceable, nx.ProxyWrapper> {
  return proxyMap;
}
