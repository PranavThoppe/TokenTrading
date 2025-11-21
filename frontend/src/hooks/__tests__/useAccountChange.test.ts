import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAccountChange } from '../useAccountChange';
import * as wagmi from 'wagmi';
import { createMockUseAccount, mockAddress } from '../../test/utils/wagmiMocks';

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}));

describe('useAccountChange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Account Change Handling', () => {
    it('should detect when account changes', () => {
      const onAccountChange = vi.fn();
      
      // Initial render with no address
      vi.mocked(wagmi.useAccount).mockReturnValue(
        createMockUseAccount({ address: undefined, isConnected: false })
      );

      const { rerender } = renderHook(() => useAccountChange(onAccountChange));

      // Callback should not be called on initial render
      expect(onAccountChange).not.toHaveBeenCalled();

      // Simulate account connection
      vi.mocked(wagmi.useAccount).mockReturnValue(
        createMockUseAccount({ address: mockAddress, isConnected: true })
      );

      rerender();

      // Now callback should be called with the new address
      expect(onAccountChange).toHaveBeenCalledWith(mockAddress);
      expect(onAccountChange).toHaveBeenCalledTimes(1);
    });

    it('should call callback when address changes to different address', () => {
      const onAccountChange = vi.fn();
      const secondAddress = '0x9876543210987654321098765432109876543210' as `0x${string}`;

      // Initial render with first address
      vi.mocked(wagmi.useAccount).mockReturnValue(
        createMockUseAccount({ address: mockAddress, isConnected: true })
      );

      const { rerender } = renderHook(() => useAccountChange(onAccountChange));

      // No callback on initial render
      expect(onAccountChange).not.toHaveBeenCalled();

      // Change to second address
      vi.mocked(wagmi.useAccount).mockReturnValue(
        createMockUseAccount({ address: secondAddress, isConnected: true })
      );

      rerender();

      // Callback should be called with the new address
      expect(onAccountChange).toHaveBeenCalledWith(secondAddress);
      expect(onAccountChange).toHaveBeenCalledTimes(1);
    });

    it('should not call callback when address remains the same', () => {
      const onAccountChange = vi.fn();

      vi.mocked(wagmi.useAccount).mockReturnValue(
        createMockUseAccount({ address: mockAddress, isConnected: true })
      );

      const { rerender } = renderHook(() => useAccountChange(onAccountChange));

      // No callback on initial render
      expect(onAccountChange).not.toHaveBeenCalled();

      // Rerender with same address
      rerender();

      // Should still not be called
      expect(onAccountChange).not.toHaveBeenCalled();
    });

    it('should work without callback function', () => {
      vi.mocked(wagmi.useAccount).mockReturnValue(
        createMockUseAccount({ address: mockAddress, isConnected: true })
      );

      const { result } = renderHook(() => useAccountChange());

      expect(result.current.address).toBe(mockAddress);
      expect(result.current.isConnected).toBe(true);
    });

    it('should return current connection state', () => {
      vi.mocked(wagmi.useAccount).mockReturnValue(
        createMockUseAccount({ address: mockAddress, isConnected: true })
      );

      const { result } = renderHook(() => useAccountChange());

      expect(result.current).toEqual({
        address: mockAddress,
        isConnected: true,
        hasChanged: false,
      });
    });
  });
});
