import ProxyWrapper from "../../utils/ProxyWrapper.js";

export default function ProxyManager(): nx.ProxyManager {
  return {
    create: jest.fn((target?: object) => new ProxyWrapper(target).proxy),
    events: {
      emit: jest.fn(),
    },
  } as object as nx.ProxyManager;
}
