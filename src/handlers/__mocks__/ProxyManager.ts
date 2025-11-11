import getProxy from "../../utils/getProxy.js";

export default function ProxyManager(): nx.ProxyManager {
  return {
    create: jest.fn(getProxy),
    events: {
      emit: jest.fn(),
    },
  } as object as nx.ProxyManager;
}
