import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultScreen } from './ResultScreen';
import { vi, test, expect } from 'vitest';

const baseProps = {
  language: 'en' as const,
  status: 'idle' as const,
  hospitalId: '' as const,
  onHospitalChange: vi.fn(),
  onSubmit: vi.fn(),
};

// ── button state ─────────────────────────────────────────────────────────────

test('button is disabled when no hospital is selected', () => {
  render(<ResultScreen {...baseProps} hospitalId="" />);
  expect(screen.getByRole('button', { name: /save my responses/i })).toBeDisabled();
});

test('button is enabled once a hospital is selected', () => {
  render(<ResultScreen {...baseProps} hospitalId="vihiga" />);
  expect(screen.getByRole('button', { name: /save my responses/i })).toBeEnabled();
});

test('button is disabled while signing in', () => {
  render(<ResultScreen {...baseProps} hospitalId="vihiga" status="signing-in" />);
  expect(screen.getByRole('button')).toBeDisabled();
});

test('button is disabled while saving', () => {
  render(<ResultScreen {...baseProps} hospitalId="vihiga" status="saving" />);
  expect(screen.getByRole('button')).toBeDisabled();
});

// ── button label changes ─────────────────────────────────────────────────────

test('button says "Save my responses" on first submission', () => {
  render(<ResultScreen {...baseProps} hospitalId="vihiga" isEditing={false} />);
  expect(screen.getByRole('button', { name: /save my responses/i })).toBeInTheDocument();
});

test('button says "Update my responses" when editing an existing submission', () => {
  render(<ResultScreen {...baseProps} hospitalId="vihiga" isEditing={true} />);
  expect(screen.getByRole('button', { name: /update my responses/i })).toBeInTheDocument();
});

test('button says "Saved" after a successful save', () => {
  render(<ResultScreen {...baseProps} hospitalId="vihiga" status="saved" />);
  expect(screen.getByRole('button', { name: /^saved$/i })).toBeInTheDocument();
});

// ── Swahili labels ───────────────────────────────────────────────────────────

test('shows Swahili hospital prompt when language is sw', () => {
  render(<ResultScreen {...baseProps} language="sw" />);
  expect(screen.getByText(/chagua hospitali/i)).toBeInTheDocument();
});

test('shows Swahili save label when language is sw', () => {
  render(<ResultScreen {...baseProps} language="sw" hospitalId="vihiga" />);
  expect(screen.getByRole('button', { name: /hifadhi majibu yangu/i })).toBeInTheDocument();
});

test('shows Swahili update label when editing and language is sw', () => {
  render(<ResultScreen {...baseProps} language="sw" hospitalId="vihiga" isEditing={true} />);
  expect(screen.getByRole('button', { name: /sasisha majibu yangu/i })).toBeInTheDocument();
});

// ── error message ────────────────────────────────────────────────────────────

test('shows error message when status is error', () => {
  render(<ResultScreen {...baseProps} hospitalId="vihiga" status="error" />);
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});

test('shows Swahili error message when language is sw and status is error', () => {
  render(<ResultScreen {...baseProps} language="sw" hospitalId="vihiga" status="error" />);
  expect(screen.getByText(/hitilafu imetokea/i)).toBeInTheDocument();
});

// ── hospital selection callback ───────────────────────────────────────────────

test('calls onHospitalChange when a hospital radio is clicked', async () => {
  const onHospitalChange = vi.fn();
  render(<ResultScreen {...baseProps} onHospitalChange={onHospitalChange} />);
  await userEvent.click(screen.getByRole('radio', { name: /vihiga/i }));
  expect(onHospitalChange).toHaveBeenCalledWith('vihiga');
});

// ── submit callback ───────────────────────────────────────────────────────────

test('calls onSubmit when the enabled button is clicked', async () => {
  const onSubmit = vi.fn();
  render(<ResultScreen {...baseProps} hospitalId="vihiga" onSubmit={onSubmit} />);
  await userEvent.click(screen.getByRole('button', { name: /save my responses/i }));
  expect(onSubmit).toHaveBeenCalledOnce();
});
