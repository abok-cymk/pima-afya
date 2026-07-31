import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, expect } from 'vitest';
import { SmokeTestCheckbox } from './SmokeTestCheckbox';

vi.mock('@/lib/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn().mockResolvedValue(undefined),
  serverTimestamp: vi.fn(),
}));

test('checking the box triggers a Firestore write and shows saved', async () => {
  render(<SmokeTestCheckbox />);
  await userEvent.click(screen.getByRole('checkbox'));

  await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('saved'));
});