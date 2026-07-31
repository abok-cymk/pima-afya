import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, test, expect, describe } from 'vitest';

// ── Mocks ───────────────────────────────────────────────────────────────────
// Must be declared before the module import so Vitest hoists them correctly.

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

vi.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
  googleProvider: {},
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn().mockResolvedValue(undefined),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  serverTimestamp: vi.fn(),
  onSnapshot: vi.fn((_ref: unknown, cb: (snap: { exists: () => boolean; data: () => { total: number } }) => void) => {
    cb({ exists: () => true, data: () => ({ total: 12 }) });
    return () => {};
  }),
}));

vi.mock('firebase/auth', () => ({
  getRedirectResult: vi.fn().mockResolvedValue(null),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn().mockResolvedValue(undefined),
}));

import { PimaAfyaForm } from './PimaAfyaForm';

beforeEach(() => {
  localStorage.clear();
});

// ── header / branding ─────────────────────────────────────────────────────────

describe('header', () => {
  test('renders the Pima Afya logo text', () => {
    render(<PimaAfyaForm />);
    expect(screen.getByRole('heading', { name: /pima afya/i })).toBeInTheDocument();
  });

  test('renders the tagline in English by default', () => {
    render(<PimaAfyaForm />);
    expect(screen.getByText(/diabetes risk self-screening tool/i)).toBeInTheDocument();
  });

  test('tagline switches to Swahili when language is changed', async () => {
    render(<PimaAfyaForm />);
    await userEvent.click(screen.getByRole('button', { name: /kiswahili/i }));
    expect(screen.getByText(/zana ya kujipima hatari ya kisukari/i)).toBeInTheDocument();
  });

  test('renders the intro paragraph', () => {
    render(<PimaAfyaForm />);
    // check for a distinctive phrase from the intro copy
    expect(screen.getByText(/under 60 seconds/i)).toBeInTheDocument();
  });
});

// ── progress bar ──────────────────────────────────────────────────────────────

describe('progress', () => {
  test('all 7 question cards are rendered', () => {
    render(<PimaAfyaForm />);
    // each QuestionCard has a yes and no checkbox; 7 questions = 14 checkboxes
    expect(screen.getAllByRole('checkbox')).toHaveLength(14);
  });
});

// ── clear all answers button ──────────────────────────────────────────────────

describe('"Clear all answers" button', () => {
  test('is not visible before any question is answered', () => {
    render(<PimaAfyaForm />);
    expect(screen.queryByText(/clear all answers/i)).not.toBeInTheDocument();
  });

  test('appears after at least one answer is given', async () => {
    render(<PimaAfyaForm />);
    await userEvent.click(screen.getByTestId('age-yes'));
    expect(screen.getByText(/clear all answers/i)).toBeInTheDocument();
  });

  test('clicking it resets all checkboxes to unchecked', async () => {
    render(<PimaAfyaForm />);
    await userEvent.click(screen.getByTestId('age-yes'));
    await userEvent.click(screen.getByTestId('gender-no'));
    await userEvent.click(screen.getByText(/clear all answers/i));
    expect(screen.getByTestId('age-yes')).not.toHaveAttribute('data-checked');
    expect(screen.getByTestId('gender-no')).not.toHaveAttribute('data-checked');
  });

  test('disappears again after answers are cleared', async () => {
    render(<PimaAfyaForm />);
    await userEvent.click(screen.getByTestId('age-yes'));
    await userEvent.click(screen.getByText(/clear all answers/i));
    expect(screen.queryByText(/clear all answers/i)).not.toBeInTheDocument();
  });
});

// ── result screen appears only when complete ──────────────────────────────────

describe('ResultScreen visibility', () => {
  async function answerAll() {
    await userEvent.click(screen.getByTestId('age-yes'));
    await userEvent.click(screen.getByTestId('gender-no'));
    await userEvent.click(screen.getByTestId('familyHistory-yes'));
    await userEvent.click(screen.getByTestId('alcoholOrSmoking-no'));
    await userEvent.click(screen.getByTestId('weight-yes'));
    await userEvent.click(screen.getByTestId('hypertension-yes'));
    await userEvent.click(screen.getByTestId('physicalActivity-yes'));
  }

  test('ResultScreen is not shown until all questions are answered', () => {
    render(<PimaAfyaForm />);
    expect(screen.queryByText(/select your nearest hospital/i)).not.toBeInTheDocument();
  });

  test('ResultScreen appears once all 7 questions are answered', async () => {
    render(<PimaAfyaForm />);
    await answerAll();
    expect(screen.getByText(/select your nearest hospital/i)).toBeInTheDocument();
  });

  test('save button is disabled until a hospital is chosen', async () => {
    render(<PimaAfyaForm />);
    await answerAll();
    expect(screen.getByRole('button', { name: /save my responses/i })).toBeDisabled();
  });
});

// ── success view → edit flow ──────────────────────────────────────────────────

describe('success view and edit flow', () => {
  test('starts in success view when a prior submission is in localStorage', () => {
    localStorage.setItem('pima_afya_submission', JSON.stringify({
      uid: 'u1', hospitalId: 'vihiga', scoreBand: 'high',
      score: 4, submittedAt: new Date().toISOString(),
    }));
    render(<PimaAfyaForm />);
    expect(screen.getByRole('button', { name: /edit answers/i })).toBeInTheDocument();
  });

  test('clicking Edit answers switches back to form view', async () => {
    localStorage.setItem('pima_afya_submission', JSON.stringify({
      uid: 'u1', hospitalId: 'vihiga', scoreBand: 'high',
      score: 4, submittedAt: new Date().toISOString(),
    }));
    render(<PimaAfyaForm />);
    await userEvent.click(screen.getByRole('button', { name: /edit answers/i }));
    // form view shows all question checkboxes
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
  });
});
