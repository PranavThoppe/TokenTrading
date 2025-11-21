import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WalletButton } from '../WalletButton';
import * as wagmi from 'wagmi';
import {
  createMockUseAccount,
  createMockUseConnect,
  createMockUseDisconnect,
  mockAddress,
  mockConnector,
} from '../../test/utils/wagmiMocks';

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useConnect: vi.fn(),
  useDisconnect: vi.fn(),
}));

describe('WalletButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Wallet Connection Flow', () => {
    it('should display connect button when wallet is not connected', () => {
      vi.mocked(wagmi.useAccount).mockReturnValue(createMockUseAccount());
      vi.mocked(wagmi.useConnect).mockReturnValue(createMockUseConnect());
      vi.mocked(wagmi.useDisconnect).mockReturnValue(createMockUseDisconnect());

      render(<WalletButton />);

      expect(screen.getByText(/Connect Wallet/i)).toBeInTheDocument();
    });

    it('should call connect function when connect button is clicked', () => {
      const mockConnect = vi.fn();
      vi.mocked(wagmi.useAccount).mockReturnValue(createMockUseAccount());
      vi.mocked(wagmi.useConnect).mockReturnValue(
        createMockUseConnect({ connect: mockConnect })
      );
      vi.mocked(wagmi.useDisconnect).mockReturnValue(createMockUseDisconnect());

      render(<WalletButton />);

      const connectButton = screen.getByText(/Connect Wallet/i);
      fireEvent.click(connectButton);

      expect(mockConnect).toHaveBeenCalledWith({ connector: mockConnector });
    });

    it('should display connecting state when connection is pending', () => {
      vi.mocked(wagmi.useAccount).mockReturnValue(createMockUseAccount());
      vi.mocked(wagmi.useConnect).mockReturnValue(
        createMockUseConnect({ isPending: true })
      );
      vi.mocked(wagmi.useDisconnect).mockReturnValue(createMockUseDisconnect());

      render(<WalletButton />);

      expect(screen.getByText(/Connecting.../i)).toBeInTheDocument();
    });

    it('should display connected wallet address when connected', () => {
      vi.mocked(wagmi.useAccount).mockReturnValue(
        createMockUseAccount({
          address: mockAddress,
          isConnected: true,
          isDisconnected: false,
        })
      );
      vi.mocked(wagmi.useConnect).mockReturnValue(createMockUseConnect());
      vi.mocked(wagmi.useDisconnect).mockReturnValue(createMockUseDisconnect());

      render(<WalletButton />);

      expect(screen.getByText(/0x1234...7890/i)).toBeInTheDocument();
      expect(screen.getByText(/Disconnect/i)).toBeInTheDocument();
    });
  });

  describe('Disconnect Functionality', () => {
    it('should call disconnect function when disconnect button is clicked', () => {
      const mockDisconnect = vi.fn();
      vi.mocked(wagmi.useAccount).mockReturnValue(
        createMockUseAccount({
          address: mockAddress,
          isConnected: true,
          isDisconnected: false,
        })
      );
      vi.mocked(wagmi.useConnect).mockReturnValue(createMockUseConnect());
      vi.mocked(wagmi.useDisconnect).mockReturnValue(
        createMockUseDisconnect({ disconnect: mockDisconnect })
      );

      render(<WalletButton />);

      const disconnectButton = screen.getByText(/Disconnect/i);
      fireEvent.click(disconnectButton);

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});
