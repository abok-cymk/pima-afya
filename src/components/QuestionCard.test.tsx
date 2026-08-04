import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, expect } from 'vitest';
import { QuestionCard } from './QuestionCard';
import type { Question } from '@/lib/questions';

const question: Question = {
  id: 'age',
  text: { en: 'What is your age?', sw: 'Umri wako ni nini?' },
  yesLabel: { en: '40 years and above', sw: 'Miaka 40 na zaidi' },
  noLabel: { en: 'Below 40', sw: 'Chini ya miaka 40' },
  points: { yes: 1, no: 0 },
};

// ── rendering ─────────────────────────────────────────────────────────────────

test('renders the question text in English', () => {
  render(<QuestionCard question={question} value={undefined} language="en" onChange={vi.fn()} />);
  expect(screen.getByText('What is your age?')).toBeInTheDocument();
});

test('renders the question text in Swahili', () => {
  render(<QuestionCard question={question} value={undefined} language="sw" onChange={vi.fn()} />);
  expect(screen.getByText('Umri wako ni nini?')).toBeInTheDocument();
});

test('renders both yes and no option labels', () => {
  render(<QuestionCard question={question} value={undefined} language="en" onChange={vi.fn()} />);
  expect(screen.getByText('40 years and above')).toBeInTheDocument();
  expect(screen.getByText('Below 40')).toBeInTheDocument();
});

// ── checked state ─────────────────────────────────────────────────────────────

test('yes checkbox is checked when value is the yes label', () => {
  render(<QuestionCard question={question} value="40 years and above" language="en" onChange={vi.fn()} />);
  expect(screen.getByTestId('age-yes')).toHaveAttribute('data-checked');
  expect(screen.getByTestId('age-no')).not.toHaveAttribute('data-checked');
});

test('no checkbox is checked when value is the no label', () => {
  render(<QuestionCard question={question} value="Below 40" language="en" onChange={vi.fn()} />);
  expect(screen.getByTestId('age-no')).toHaveAttribute('data-checked');
  expect(screen.getByTestId('age-yes')).not.toHaveAttribute('data-checked');
});

test('neither checkbox is checked when value is undefined', () => {
  render(<QuestionCard question={question} value={undefined} language="en" onChange={vi.fn()} />);
  expect(screen.getByTestId('age-yes')).not.toHaveAttribute('data-checked');
  expect(screen.getByTestId('age-no')).not.toHaveAttribute('data-checked');
});

// ── callbacks ─────────────────────────────────────────────────────────────────

test('calls onChange with yes label when the yes checkbox is clicked', async () => {
  const onChange = vi.fn();
  render(<QuestionCard question={question} value={undefined} language="en" onChange={onChange} />);
  await userEvent.click(screen.getByTestId('age-yes'));
  expect(onChange).toHaveBeenCalledWith('40 years and above');
});

test('calls onChange with no label when the no checkbox is clicked', async () => {
  const onChange = vi.fn();
  render(<QuestionCard question={question} value={undefined} language="en" onChange={onChange} />);
  await userEvent.click(screen.getByTestId('age-no'));
  expect(onChange).toHaveBeenCalledWith('Below 40');
});
