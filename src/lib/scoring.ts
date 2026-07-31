import { QUESTIONS } from './questions';
import type { Answers, RiskBand } from '@/types/pima-afya';

export function computeScore(answers: Answers): number {
  return QUESTIONS.reduce((total, q) => {
    const value = answers[q.id];
    if (value === undefined) return total;
    return total + (value ? q.points.yes : q.points.no);
  }, 0);
}

export function isComplete(answers: Answers): boolean {
  return QUESTIONS.every((q) => answers[q.id] !== undefined);
}

export function getRiskBand(score: number): RiskBand {
  return score >= 4 ? 'high' : 'low';
}