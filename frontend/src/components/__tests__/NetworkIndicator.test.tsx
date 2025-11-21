import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NetworkIndicator } from '../NetworkIndicator';
import * as useNetworkValidationHook from '../../hooks/useNetworkValidation';

vi.mock('../../hooks/useNetworkValidation');

describe('NetworkIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Network Switching', () => {
    it('should display correct network when on supported network', () => {
      vi.mocked(useNetworkValidationHook.useNetworkValidation).mockReturnValue({
        isWrongNetwork: false,
        currentChainId: 11155111,
        supportedChainId: 11155111,
        supportedChainName: 'Sepolia',
        switchNetwork: vi.fn(),
        canSwitchNetwork: true,
      });

      render(<NetworkIndicator />);

      expect(screen.getByText(/Sepolia/i)).toBeInTheDocument();
      expect(screen.queryByText(/Wrong Network/i)).not.toBeInTheDocument();
    });

    it('should display wrong network warning when on unsupported network', () => {
      vi.mocked(useNetworkValidationHook.useNetworkValidation).mockReturnValue({
        isWrongNetwork: true,
        currentChainId: 1,
        supportedChainId: 11155111,
        supportedChainName: 'Sepolia',
        switchNetwork: vi.fn(),
        canSwitchNetwork: true,
      });

      render(<NetworkIndicator />);

      expect(screen.getByText(/Wrong Network/i)).toBeInTheDocument();
      expect(screen.getByText(/Switch/i)).toBeInTheDocument();
    });

    it('should call switchNetwork when switch button is clicked', () => {
      const mockSwitchNetwork = vi.fn();
      vi.mocked(useNetworkValidationHook.useNetworkValidation).mockReturnValue({
        isWrongNetwork: true,
        currentChainId: 1,
        supportedChainId: 11155111,
        supportedChainName: 'Sepolia',
        switchNetwork: mockSwitchNetwork,
        canSwitchNetwork: true,
      });

      render(<NetworkIndicator />);

      const switchButton = screen.getByText(/Switch/i);
      fireEvent.click(switchButton);

      expect(mockSwitchNetwork).toHaveBeenCalled();
    });

    it('should not display switch button when switching is not available', () => {
      vi.mocked(useNetworkValidationHook.useNetworkValidation).mockReturnValue({
        isWrongNetwork: true,
        currentChainId: 1,
        supportedChainId: 11155111,
        supportedChainName: 'Sepolia',
        switchNetwork: vi.fn(),
        canSwitchNetwork: false,
      });

      render(<NetworkIndicator />);

      expect(screen.getByText(/Wrong Network/i)).toBeInTheDocument();
      expect(screen.queryByText(/Switch to Sepolia/i)).not.toBeInTheDocument();
    });
  });
});
