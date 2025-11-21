import { vi } from 'vitest';

export const mockConnector = {
  id: 'mock',
  name: 'Mock Wallet',
  type: 'injected' as const,
  icon: 'mock-icon',
};

export const mockAddress = '0x1234567890123456789012345678901234567890' as `0x${string}`;

export const createMockUseAccount = (overrides = {}) => ({
  address: undefined,
  isConnected: false,
  isConnecting: false,
  isDisconnected: true,
  ...overrides,
});

export const createMockUseConnect = (overrides = {}) => ({
  connect: vi.fn(),
  connectors: [mockConnector],
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null,
  ...overrides,
});

export const createMockUseDisconnect = (overrides = {}) => ({
  disconnect: vi.fn(),
  isPending: false,
  isSuccess: false,
  isError: false,
  ...overrides,
});

export const createMockUseChainId = (chainId = 11155111) => chainId;

export const createMockUseSwitchChain = (overrides = {}) => ({
  switchChain: vi.fn(),
  isPending: false,
  isSuccess: false,
  isError: false,
  ...overrides,
});

export const createMockUseBalance = (overrides = {}) => ({
  data: {
    value: BigInt('1000000000000000000'),
    decimals: 18,
    symbol: 'ETH',
    formatted: '1.0',
  },
  isLoading: false,
  isError: false,
  ...overrides,
});
