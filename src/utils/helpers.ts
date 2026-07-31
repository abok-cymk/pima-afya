import { ANSWERS_KEY, LANGUAGE_KEY, HOSPITAL_KEY, SUBMISSION_KEY } from "@/lib/constants";
import type { Answers, Language, SubmissionSnapshot } from "@/types/pima-afya";
import type { HospitalId } from "@/lib/hospitals";

export function loadAnswers(): Answers {
  try {
    const raw = localStorage.getItem(ANSWERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function loadLanguage(): Language {
  return localStorage.getItem(LANGUAGE_KEY) === "sw" ? "sw" : "en";
}

export function loadHospital(): HospitalId | null {
  const raw = localStorage.getItem(HOSPITAL_KEY);
  return raw === "vihiga" || raw === "mbagathi" ? raw : null;
}

export function loadSubmission(): SubmissionSnapshot | null {
  try {
    const raw = localStorage.getItem(SUBMISSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
