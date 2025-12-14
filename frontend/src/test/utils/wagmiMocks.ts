import { vi } from 'vitest';
import type { UseAccountReturnType, UseConnectReturnType, UseDisconnectReturnType, UseSwitchChainReturnType } from 'wagmi';

export const mockConnector = {
  id: 'mock',
  name: 'Mock Wallet',
  type: 'injected' as const,
  icon: 'mock-icon',
};

export const mockAddress = '0x1234567890123456789012345678901234567890' as `0x${string}`;

export const createMockUseAccount = (overrides: Partial<UseAccountReturnType> = {}): UseAccountReturnType => ({
  address: undefined,
  addresses: undefined,
  chain: undefined,
  chainId: undefined,
  connector: undefined,
  isConnected: false,
  isReconnecting: false,
  isConnecting: false,
  isDisconnected: true,
  status: 'disconnected',
  ...overrides,
} as UseAccountReturnType);

export const createMockUseConnect = (overrides: Partial<UseConnectReturnType> = {}): UseConnectReturnType => ({
  connect: vi.fn(),
  connectAsync: vi.fn(),
  connectors: [mockConnector] as any,
  data: undefined,
  error: null,
  failureCount: 0,
  failureReason: null,
  isError: false,
  isIdle: true,
  isPaused: false,
  isPending: false,
  isSuccess: false,
  reset: vi.fn(),
  status: 'idle',
  submittedAt: 0,
  variables: undefined,
  ...overrides,
} as UseConnectReturnType);

export const createMockUseDisconnect = (overrides: Partial<UseDisconnectReturnType> = {}): UseDisconnectReturnType => ({
  disconnect: vi.fn(),
  disconnectAsync: vi.fn(),
  data: undefined,
  error: null,
  failureCount: 0,
  failureReason: null,
  isError: false,
  isIdle: true,
  isPaused: false,
  isPending: false,
  isSuccess: false,
  reset: vi.fn(),
  status: 'idle',
  submittedAt: 0,
  variables: undefined,
  ...overrides,
} as UseDisconnectReturnType);

export const createMockUseChainId = (chainId = 11155111) => chainId;

export const createMockUseSwitchChain = (overrides: Partial<UseSwitchChainReturnType> = {}): UseSwitchChainReturnType => ({
  switchChain: vi.fn(),
  switchChainAsync: vi.fn(),
  chains: [],
  context: undefined,
  data: undefined,
  error: null,
  failureCount: 0,
  failureReason: null,
  isError: false,
  isIdle: true,
  isPaused: false,
  isPending: false,
  isSuccess: false,
  reset: vi.fn(),
  status: 'idle',
  submittedAt: 0,
  variables: undefined,
  ...overrides,
} as UseSwitchChainReturnType);

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
