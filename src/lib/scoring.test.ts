import { test, expect } from 'vitest';
import { computeScore, isComplete, getRiskBand } from './scoring';
import type { Answers } from '@/types/pima-afya';

const allNo: Answers = {
  age: false, gender: false, familyHistory: false,
  alcoholOrSmoking: false, weight: false, hypertension: false,
  physicalActivity: true, // "yes, active" scores 0 here
};

test('all-low-risk answers score 0', () => {
  expect(computeScore(allNo)).toBe(0);
  expect(getRiskBand(0)).toBe('low');
});

test('physical activity is reverse-scored', () => {
  const inactive: Answers = { ...allNo, physicalActivity: false };
  expect(computeScore(inactive)).toBe(1);
});

test('four risk factors crosses into high risk', () => {
  const highRisk: Answers = {
    age: true, gender: true, familyHistory: true, alcoholOrSmoking: true,
    weight: false, hypertension: false, physicalActivity: true,
  };
  expect(computeScore(highRisk)).toBe(4);
  expect(getRiskBand(4)).toBe('high');
});

test('maximum score is 7 (all risk factors, physically inactive)', () => {
  const allRisk: Answers = {
    age: true, gender: true, familyHistory: true, alcoholOrSmoking: true,
    weight: true, hypertension: true, physicalActivity: false,
  };
  expect(computeScore(allRisk)).toBe(7);
  expect(getRiskBand(7)).toBe('high');
});

test('score of 3 stays in low risk band', () => {
  const threeRisk: Answers = {
    age: true, gender: true, familyHistory: true, alcoholOrSmoking: false,
    weight: false, hypertension: false, physicalActivity: true,
  };
  expect(computeScore(threeRisk)).toBe(3);
  expect(getRiskBand(3)).toBe('low');
});

test('isComplete is false until all seven are answered', () => {
  expect(isComplete({ age: true })).toBe(false);
  expect(isComplete(allNo)).toBe(true);
});

test('isComplete is false for an empty answers object', () => {
  expect(isComplete({})).toBe(false);
});

test('computeScore ignores unanswered questions', () => {
  // only one question answered — should not throw, just score that one
  expect(computeScore({ age: true })).toBe(1);
});
