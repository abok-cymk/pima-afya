import type { HospitalId } from '@/lib/hospitals';

export type QuestionId =
  | 'age'
  | 'gender'
  | 'familyHistory'
  | 'alcoholOrSmoking'
  | 'weight'
  | 'hypertension'
  | 'physicalActivity';

export type Answers = Partial<Record<QuestionId, string>>;
export type Language = 'en' | 'sw';
export type RiskBand = 'high' | 'low';
export type SubmitStatus = 'idle' | 'saving' | 'saved' | 'error';
export type { HospitalId };

export interface SubmissionSnapshot {
  phone: string;
  hospitalId: HospitalId;
  scoreBand: RiskBand;
  score: number;
  submittedAt: string;
  updatedAt?: string;
}