import { renderHook, act } from '@testing-library/react';
import { vi, beforeEach, test, expect, describe } from 'vitest';

// ── Firebase mocks ────────────────────────────────────────────────────────────
// Must be declared before the module import so Vitest hoists them correctly.

const {
  mockDoc,
  mockSetDoc,
  mockUpdateDoc,
  mockGetDoc,
  mockServerTimestamp,
  mockGetRedirectResult,
  mockSignInWithPopup,
  mockSignInWithRedirect,
} = vi.hoisted(() => ({
  mockDoc: vi.fn().mockReturnValue('__docRef__'),
  mockSetDoc: vi.fn().mockResolvedValue(undefined),
  mockUpdateDoc: vi.fn().mockResolvedValue(undefined),
  mockGetDoc: vi.fn().mockResolvedValue({ exists: () => false, data: () => ({}) }),
  mockServerTimestamp: vi.fn().mockReturnValue('__serverTimestamp__'),
  mockGetRedirectResult: vi.fn().mockResolvedValue(null),
  mockSignInWithPopup: vi.fn().mockResolvedValue({ user: { uid: 'uid-1', email: 'test@example.com' } }),
  mockSignInWithRedirect: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
  googleProvider: {},
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: mockDoc,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  getDoc: mockGetDoc,
  serverTimestamp: mockServerTimestamp,
}));

vi.mock('firebase/auth', () => ({
  getRedirectResult: mockGetRedirectResult,
  signInWithPopup: mockSignInWithPopup,
  signInWithRedirect: mockSignInWithRedirect,
}));

// ── import after mocks ────────────────────────────────────────────────────────

import { usePimaAfya } from './usePimaAfya';

// ── helpers ───────────────────────────────────────────────────────────────────

const ALL_ANSWERS = {
  age: true, gender: true, familyHistory: true, alcoholOrSmoking: true,
  weight: false, hypertension: false, physicalActivity: true,
};

function seedLocalStorage(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    pima_afya_answers: JSON.stringify(ALL_ANSWERS),
    pima_afya_language: 'en',
  };
  Object.entries({ ...defaults, ...overrides }).forEach(([k, v]) =>
    localStorage.setItem(k, v),
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  mockGetRedirectResult.mockResolvedValue(null);
  mockGetDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
});

// ── localStorage hydration ────────────────────────────────────────────────────

describe('localStorage hydration', () => {
  test('loads saved answers from localStorage on mount', () => {
    seedLocalStorage();
    const { result } = renderHook(() => usePimaAfya());
    expect(result.current.answers).toEqual(ALL_ANSWERS);
  });

  test('loads saved language from localStorage on mount', () => {
    seedLocalStorage({ pima_afya_language: 'sw' });
    const { result } = renderHook(() => usePimaAfya());
    expect(result.current.language).toBe('sw');
  });

  test('starts in success view when a submission exists in localStorage', () => {
    const snapshot = {
      uid: 'uid-1', hospitalId: 'vihiga', scoreBand: 'high',
      score: 4, submittedAt: new Date().toISOString(),
    };
    seedLocalStorage({ pima_afya_submission: JSON.stringify(snapshot) });
    const { result } = renderHook(() => usePimaAfya());
    expect(result.current.view).toBe('success');
  });

  test('starts in form view when no submission exists', () => {
    const { result } = renderHook(() => usePimaAfya());
    expect(result.current.view).toBe('form');
  });
});

// ── answer management ─────────────────────────────────────────────────────────

describe('answer management', () => {
  test('setAnswer updates a single answer', () => {
    const { result } = renderHook(() => usePimaAfya());
    act(() => { result.current.setAnswer('age', true); });
    expect(result.current.answers.age).toBe(true);
  });

  test('answeredCount increments as answers are set', () => {
    const { result } = renderHook(() => usePimaAfya());
    expect(result.current.answeredCount).toBe(0);
    act(() => { result.current.setAnswer('age', true); });
    expect(result.current.answeredCount).toBe(1);
  });

  test('isComplete becomes true only when all 7 questions are answered', () => {
    seedLocalStorage();
    const { result } = renderHook(() => usePimaAfya());
    expect(result.current.isComplete).toBe(true);
  });

  test('score is null when form is incomplete', () => {
    const { result } = renderHook(() => usePimaAfya());
    expect(result.current.score).toBeNull();
  });

  test('score is computed when form is complete', () => {
    seedLocalStorage();
    const { result } = renderHook(() => usePimaAfya());
    // age+gender+familyHistory+alcoholOrSmoking = 4, physicalActivity=true(0)
    expect(result.current.score).toBe(4);
  });
});

// ── clearAnswers ──────────────────────────────────────────────────────────────

describe('clearAnswers', () => {
  test('resets all answers to empty', () => {
    seedLocalStorage();
    const { result } = renderHook(() => usePimaAfya());
    act(() => { result.current.clearAnswers(); });
    expect(result.current.answers).toEqual({});
  });

  test('resets hospitalId to empty string', () => {
    seedLocalStorage();
    const { result } = renderHook(() => usePimaAfya());
    act(() => { result.current.setHospitalId('vihiga'); });
    act(() => { result.current.clearAnswers(); });
    expect(result.current.hospitalId).toBe('');
  });

  test('answeredCount is 0 after clearing', () => {
    seedLocalStorage();
    const { result } = renderHook(() => usePimaAfya());
    act(() => { result.current.clearAnswers(); });
    expect(result.current.answeredCount).toBe(0);
  });
});

// ── language ──────────────────────────────────────────────────────────────────

describe('language', () => {
  test('setLanguage updates language state', () => {
    const { result } = renderHook(() => usePimaAfya());
    act(() => { result.current.setLanguage('sw'); });
    expect(result.current.language).toBe('sw');
  });

  test('language is persisted to localStorage', () => {
    const { result } = renderHook(() => usePimaAfya());
    act(() => { result.current.setLanguage('sw'); });
    expect(localStorage.getItem('pima_afya_language')).toBe('sw');
  });
});

// ── editAnswers / isEditing ───────────────────────────────────────────────────

describe('editAnswers and isEditing', () => {
  test('editAnswers switches view from success to form', () => {
    const snapshot = {
      uid: 'uid-1', hospitalId: 'vihiga', scoreBand: 'high',
      score: 4, submittedAt: new Date().toISOString(),
    };
    seedLocalStorage({ pima_afya_submission: JSON.stringify(snapshot) });
    const { result } = renderHook(() => usePimaAfya());
    expect(result.current.view).toBe('success');
    act(() => { result.current.editAnswers(); });
    expect(result.current.view).toBe('form');
  });

  test('isEditing is true after editAnswers is called', () => {
    const snapshot = {
      uid: 'uid-1', hospitalId: 'vihiga', scoreBand: 'high',
      score: 4, submittedAt: new Date().toISOString(),
    };
    seedLocalStorage({ pima_afya_submission: JSON.stringify(snapshot) });
    const { result } = renderHook(() => usePimaAfya());
    act(() => { result.current.editAnswers(); });
    expect(result.current.isEditing).toBe(true);
  });

  test('isEditing is false on a fresh form with no prior submission', () => {
    const { result } = renderHook(() => usePimaAfya());
    expect(result.current.isEditing).toBe(false);
  });
});

// ── popup cancel clears hospital ──────────────────────────────────────────────

describe('popup cancel behaviour', () => {
  test('cancelling the auth popup resets status to idle', async () => {
    seedLocalStorage();
    mockSignInWithPopup.mockRejectedValueOnce(
      Object.assign(new Error('closed'), { code: 'auth/popup-closed-by-user' }),
    );
    const { result } = renderHook(() => usePimaAfya());
    act(() => { result.current.setHospitalId('vihiga'); });

    await act(async () => { await result.current.submit(); });

    expect(result.current.status).toBe('idle');
  });

  test('cancelling the auth popup clears the hospitalId', async () => {
    seedLocalStorage();
    mockSignInWithPopup.mockRejectedValueOnce(
      Object.assign(new Error('closed'), { code: 'auth/popup-closed-by-user' }),
    );
    const { result } = renderHook(() => usePimaAfya());
    act(() => { result.current.setHospitalId('vihiga'); });

    await act(async () => { await result.current.submit(); });

    expect(result.current.hospitalId).toBe('');
  });

  test('cancelling the auth popup removes hospital from localStorage', async () => {
    seedLocalStorage();
    mockSignInWithPopup.mockRejectedValueOnce(
      Object.assign(new Error('closed'), { code: 'auth/popup-closed-by-user' }),
    );
    const { result } = renderHook(() => usePimaAfya());
    act(() => { result.current.setHospitalId('vihiga'); });

    await act(async () => { await result.current.submit(); });

    expect(localStorage.getItem('pima_afya_hospital')).toBeNull();
  });

  test('cancelling sets no error message', async () => {
    seedLocalStorage();
    mockSignInWithPopup.mockRejectedValueOnce(
      Object.assign(new Error('closed'), { code: 'auth/popup-closed-by-user' }),
    );
    const { result } = renderHook(() => usePimaAfya());
    act(() => { result.current.setHospitalId('vihiga'); });

    await act(async () => { await result.current.submit(); });

    expect(result.current.error).toBeNull();
  });

  test('auth/user-cancelled is treated the same as popup-closed-by-user', async () => {
    seedLocalStorage();
    mockSignInWithPopup.mockRejectedValueOnce(
      Object.assign(new Error('cancelled'), { code: 'auth/user-cancelled' }),
    );
    const { result } = renderHook(() => usePimaAfya());
    act(() => { result.current.setHospitalId('mbagathi'); });

    await act(async () => { await result.current.submit(); });

    expect(result.current.status).toBe('idle');
    expect(result.current.hospitalId).toBe('');
  });
});

// ── real auth errors still surface ───────────────────────────────────────────

describe('non-cancel auth errors', () => {
  test('unexpected auth errors set status to error', async () => {
    seedLocalStorage();
    mockSignInWithPopup.mockRejectedValueOnce(
      Object.assign(new Error('network error'), { code: 'auth/network-request-failed' }),
    );
    const { result } = renderHook(() => usePimaAfya());
    act(() => { result.current.setHospitalId('vihiga'); });

    await act(async () => { await result.current.submit(); });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toMatch(/network error/i);
  });
});
