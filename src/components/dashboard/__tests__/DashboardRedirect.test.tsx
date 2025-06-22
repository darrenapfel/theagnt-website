import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import DashboardRedirect from '../DashboardRedirect';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('DashboardRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  it('renders children for external users', () => {
    render(
      <DashboardRedirect userEmail="user@gmail.com">
        <div data-testid="dashboard-content">External Dashboard</div>
      </DashboardRedirect>
    );

    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirects internal users to /internal', () => {
    render(
      <DashboardRedirect userEmail="user@theagnt.ai">
        <div data-testid="dashboard-content">Should not show</div>
      </DashboardRedirect>
    );

    expect(mockPush).toHaveBeenCalledWith('/internal');
    expect(screen.queryByTestId('dashboard-content')).not.toBeInTheDocument();
  });

  it('redirects admin users to /internal', () => {
    render(
      <DashboardRedirect userEmail="darrenapfel@gmail.com">
        <div data-testid="dashboard-content">Should not show</div>
      </DashboardRedirect>
    );

    expect(mockPush).toHaveBeenCalledWith('/internal');
    expect(screen.queryByTestId('dashboard-content')).not.toBeInTheDocument();
  });

  it('shows loading state during redirect', () => {
    render(
      <DashboardRedirect userEmail="user@theagnt.ai">
        <div data-testid="dashboard-content">Should not show</div>
      </DashboardRedirect>
    );

    expect(screen.getByText('Redirecting to internal dashboard...')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-content')).not.toBeInTheDocument();
  });

  it('handles null/undefined email gracefully', () => {
    render(
      <DashboardRedirect userEmail={null}>
        <div data-testid="dashboard-content">External Dashboard</div>
      </DashboardRedirect>
    );

    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('handles undefined email gracefully', () => {
    render(
      <DashboardRedirect userEmail={undefined}>
        <div data-testid="dashboard-content">External Dashboard</div>
      </DashboardRedirect>
    );

    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});