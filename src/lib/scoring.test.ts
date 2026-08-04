import { test, expect } from 'vitest';
import { computeScore, isComplete, getRiskBand } from './scoring';
import type { Answers } from '@/types/pima-afya';

const allNo: Answers = {
  age: 'Below 40', 
  gender: 'Female', 
  familyHistory: 'No',
  alcoholOrSmoking: 'No', 
  weight: 'Okay / slim', 
  hypertension: 'No',
  physicalActivity: 'Yes', // "yes, active" scores 0 here
};

test('all-low-risk answers score 0', () => {
  expect(computeScore(allNo)).toBe(0);
  expect(getRiskBand(0)).toBe('low');
});

test('physical activity is reverse-scored', () => {
  const inactive: Answers = { ...allNo, physicalActivity: 'No' };
  expect(computeScore(inactive)).toBe(1);
});

test('four risk factors crosses into high risk', () => {
  const highRisk: Answers = {
    age: '40 years and above', 
    gender: 'Male', 
    familyHistory: 'Yes', 
    alcoholOrSmoking: 'Yes',
    weight: 'Okay / slim', 
    hypertension: 'No', 
    physicalActivity: 'Yes',
  };
  expect(computeScore(highRisk)).toBe(4);
  expect(getRiskBand(4)).toBe('high');
});

test('maximum score is 7 (all risk factors, physically inactive)', () => {
  const allRisk: Answers = {
    age: '40 years and above', 
    gender: 'Male', 
    familyHistory: 'Yes', 
    alcoholOrSmoking: 'Yes',
    weight: 'Heavy', 
    hypertension: 'Yes', 
    physicalActivity: 'No',
  };
  expect(computeScore(allRisk)).toBe(7);
  expect(getRiskBand(7)).toBe('high');
});

test('score of 3 stays in low risk band', () => {
  const threeRisk: Answers = {
    age: '40 years and above', 
    gender: 'Male', 
    familyHistory: 'Yes', 
    alcoholOrSmoking: 'No',
    weight: 'Okay / slim', 
    hypertension: 'No', 
    physicalActivity: 'Yes',
  };
  expect(computeScore(threeRisk)).toBe(3);
  expect(getRiskBand(3)).toBe('low');
});

test('isComplete is false until all seven are answered', () => {
  expect(isComplete({ age: '40 years and above' })).toBe(false);
  expect(isComplete(allNo)).toBe(true);
});

test('isComplete is false for an empty answers object', () => {
  expect(isComplete({})).toBe(false);
});

test('computeScore ignores unanswered questions', () => {
  // only one question answered — should not throw, just score that one
  expect(computeScore({ age: '40 years and above' })).toBe(1);
});
