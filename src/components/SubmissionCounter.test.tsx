import { render, screen } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import { SubmissionCounter } from './SubmissionCounter';

vi.mock('@/lib/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  onSnapshot: vi.fn((_ref, callback) => {
    callback({ exists: () => true, data: () => ({ total: 42 }) });
    return () => {}; // unsubscribe fn
  }),
}));

test('renders the live submission count from Firestore', () => {
  render(<SubmissionCounter language="en" />);
  expect(screen.getByTestId('submission-count')).toHaveTextContent('42');
});