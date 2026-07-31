import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuccessScreen } from './SuccessScreen';
import type { SubmissionSnapshot } from '@/types/pima-afya';

const baseSnapshot: SubmissionSnapshot = {
  uid: 'test-uid-123',
  hospitalId: 'vihiga',
  scoreBand: 'high',
  score: 4,
  submittedAt: '2026-07-30T10:00:00Z',
};

// ── date display ─────────────────────────────────────────────────────────────

test('shows the submission date in English', () => {
  render(<SuccessScreen snapshot={baseSnapshot} language="en" onEdit={vi.fn()} />);
  expect(screen.getByTestId('submitted-date')).toHaveTextContent(/Submitted/);
});

test('shows the submission date label in Swahili', () => {
  render(<SuccessScreen snapshot={baseSnapshot} language="sw" onEdit={vi.fn()} />);
  expect(screen.getByTestId('submitted-date')).toHaveTextContent(/Iliwasilishwa/);
});

// ── score display ─────────────────────────────────────────────────────────────

test('shows the numeric score', () => {
  render(<SuccessScreen snapshot={baseSnapshot} language="en" onEdit={vi.fn()} />);
  expect(screen.getByTestId('score-value')).toHaveTextContent('4');
});

// ── risk band display ─────────────────────────────────────────────────────────

test('shows High risk label for a high-band result', () => {
  render(<SuccessScreen snapshot={baseSnapshot} language="en" onEdit={vi.fn()} />);
  expect(screen.getByText(/high risk/i)).toBeInTheDocument();
});

test('shows Low risk label for a low-band result', () => {
  const lowSnapshot: SubmissionSnapshot = { ...baseSnapshot, scoreBand: 'low', score: 1 };
  render(<SuccessScreen snapshot={lowSnapshot} language="en" onEdit={vi.fn()} />);
  expect(screen.getByText(/low risk/i)).toBeInTheDocument();
});

// ── hospital display ──────────────────────────────────────────────────────────

test('shows the selected hospital name in English', () => {
  render(<SuccessScreen snapshot={baseSnapshot} language="en" onEdit={vi.fn()} />);
  expect(screen.getByText(/vihiga county referral hospital/i)).toBeInTheDocument();
});

test('shows the selected hospital name in Swahili', () => {
  render(<SuccessScreen snapshot={baseSnapshot} language="sw" onEdit={vi.fn()} />);
  expect(screen.getByText(/hospitali ya rufaa ya kaunti ya vihiga/i)).toBeInTheDocument();
});

// ── updatedAt ─────────────────────────────────────────────────────────────────

test('shows Updated timestamp when snapshot has updatedAt', () => {
  const updatedSnapshot: SubmissionSnapshot = {
    ...baseSnapshot,
    updatedAt: '2026-07-31T08:00:00Z',
  };
  render(<SuccessScreen snapshot={updatedSnapshot} language="en" onEdit={vi.fn()} />);
  expect(screen.getByText(/updated/i)).toBeInTheDocument();
});

test('does not show Updated when snapshot has no updatedAt', () => {
  render(<SuccessScreen snapshot={baseSnapshot} language="en" onEdit={vi.fn()} />);
  expect(screen.queryByText(/^Updated:/i)).not.toBeInTheDocument();
});

// ── edit button ───────────────────────────────────────────────────────────────

test('Edit answers button fires the onEdit callback', async () => {
  const onEdit = vi.fn();
  render(<SuccessScreen snapshot={baseSnapshot} language="en" onEdit={onEdit} />);
  await userEvent.click(screen.getByRole('button', { name: /edit answers/i }));
  expect(onEdit).toHaveBeenCalledOnce();
});

test('edit button label is in Swahili when language is sw', () => {
  render(<SuccessScreen snapshot={baseSnapshot} language="sw" onEdit={vi.fn()} />);
  expect(screen.getByRole('button', { name: /rekebisha majibu/i })).toBeInTheDocument();
});
