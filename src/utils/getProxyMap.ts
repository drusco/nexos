const proxyMap = new WeakMap();

export default function getProxyMap(): WeakMap<object, nx.ProxyWrapper> {
  return proxyMap;
}
