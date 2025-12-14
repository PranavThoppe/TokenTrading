import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNetworkValidation } from '../useNetworkValidation';
import * as wagmi from 'wagmi';
import { createMockUseAccount, createMockUseSwitchChain } from '../../test/utils/wagmiMocks';

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useChainId: vi.fn(),
  useSwitchChain: vi.fn(),
}));

vi.mock('wagmi/chains', () => ({
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
  },
}));

describe('useNetworkValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Network Validation', () => {
    it('should return isWrongNetwork as false when on supported network', () => {
      vi.mocked(wagmi.useAccount).mockReturnValue(
        createMockUseAccount({ isConnected: true })
      );
      vi.mocked(wagmi.useChainId).mockReturnValue(11155111);
      vi.mocked(wagmi.useSwitchChain).mockReturnValue(
        createMockUseSwitchChain()
      );

      const { result } = renderHook(() => useNetworkValidation());

      expect(result.current.isWrongNetwork).toBe(false);
      expect(result.current.currentChainId).toBe(11155111);
      expect(result.current.supportedChainId).toBe(11155111);
    });

    it('should return isWrongNetwork as true when on unsupported network', () => {
      vi.mocked(wagmi.useAccount).mockReturnValue(
        createMockUseAccount({ isConnected: true })
      );
      vi.mocked(wagmi.useChainId).mockReturnValue(1); // Mainnet
      vi.mocked(wagmi.useSwitchChain).mockReturnValue(
        createMockUseSwitchChain()
      );

      const { result } = renderHook(() => useNetworkValidation());

      expect(result.current.isWrongNetwork).toBe(true);
      expect(result.current.currentChainId).toBe(1);
      expect(result.current.supportedChainId).toBe(11155111);
    });

    it('should return correct supported chain name', () => {
      vi.mocked(wagmi.useAccount).mockReturnValue(
        createMockUseAccount({ isConnected: true })
      );
      vi.mocked(wagmi.useChainId).mockReturnValue(11155111);
      vi.mocked(wagmi.useSwitchChain).mockReturnValue(
        createMockUseSwitchChain()
      );

      const { result } = renderHook(() => useNetworkValidation());

      expect(result.current.supportedChainName).toBe('Sepolia');
    });

    it('should call switchChain with correct chainId when switchNetwork is called', () => {
      const mockSwitchChain = vi.fn();
      vi.mocked(wagmi.useAccount).mockReturnValue(
        createMockUseAccount({ isConnected: true })
      );
      vi.mocked(wagmi.useChainId).mockReturnValue(1);
      vi.mocked(wagmi.useSwitchChain).mockReturnValue(
        createMockUseSwitchChain({ switchChain: mockSwitchChain })
      );

      const { result } = renderHook(() => useNetworkValidation());

      result.current.switchNetwork();

      expect(mockSwitchChain).toHaveBeenCalledWith({ chainId: 11155111 });
    });

    it('should return canSwitchNetwork as true when switchChain is available', () => {
      vi.mocked(wagmi.useAccount).mockReturnValue(
        createMockUseAccount({ isConnected: true })
      );
      vi.mocked(wagmi.useChainId).mockReturnValue(11155111);
      vi.mocked(wagmi.useSwitchChain).mockReturnValue(
        createMockUseSwitchChain()
      );

      const { result } = renderHook(() => useNetworkValidation());

      expect(result.current.canSwitchNetwork).toBe(true);
    });

    it('should return canSwitchNetwork as false when switchChain is not available', () => {
      vi.mocked(wagmi.useAccount).mockReturnValue(
        createMockUseAccount({ isConnected: true })
      );
      vi.mocked(wagmi.useChainId).mockReturnValue(11155111);
      // Mock a scenario where switchChain might be unavailable by using a function that returns undefined
      const mockSwitchChainValue = createMockUseSwitchChain();
      // @ts-expect-error - Testing case where switchChain might be undefined
      mockSwitchChainValue.switchChain = undefined;
      vi.mocked(wagmi.useSwitchChain).mockReturnValue(mockSwitchChainValue);

      const { result } = renderHook(() => useNetworkValidation());

      expect(result.current.canSwitchNetwork).toBe(false);
    });
  });
});
