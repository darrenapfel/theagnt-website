import { render, screen } from '@testing-library/react';
import React from 'react';
import Logo from '../ui/Logo';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    h1: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className={className} {...props}>
        {children}
      </h1>
    ),
    span: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span className={className} {...props}>
        {children}
      </span>
    ),
  },
}));

describe('Logo Component', () => {
  it('renders the logo text', () => {
    render(<Logo />);
    expect(screen.getByText('theAGNT.ai')).toBeInTheDocument();
  });

  it('renders as h1 element', () => {
    render(<Logo animated={false} />);
    const logoElement = screen.getByRole('heading', { level: 1 });
    expect(logoElement).toHaveTextContent('theAGNT.ai');
  });

  it('renders without errors for different size props', () => {
    // Test that component renders without crashing with different props
    const { rerender } = render(<Logo size="large" />);
    expect(screen.getByText('theAGNT.ai')).toBeInTheDocument();

    rerender(<Logo size="default" />);
    expect(screen.getByText('theAGNT.ai')).toBeInTheDocument();
  });

  it('renders both animated and non-animated versions', () => {
    const { rerender } = render(<Logo animated={true} />);
    expect(screen.getByText('theAGNT.ai')).toBeInTheDocument();

    rerender(<Logo animated={false} />);
    expect(screen.getByText('theAGNT.ai')).toBeInTheDocument();
  });
});
