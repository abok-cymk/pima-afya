import { render, screen } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import { SubmissionCounter } from './SubmissionCounter';

vi.mock('@/hooks/useSubmissionCount', () => ({
  useSubmissionCount: () => 42,
}));

test('renders the live submission count from Firestore', () => {
  render(<SubmissionCounter language="en" />);
  expect(screen.getByTestId('submission-count')).toHaveTextContent('42');
});