import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { normalizeKenyanPhone } from "@/lib/phone"
import { QUESTIONS } from "@/lib/questions"
import {
  computeScore,
  getRiskBand,
  isComplete as checkComplete,
} from "@/lib/scoring"
import {
  ANSWERS_KEY,
  LANGUAGE_KEY,
  HOSPITAL_KEY,
  SUBMISSION_KEY,
} from "@/lib/constants"
import {
  loadAnswers,
  loadLanguage,
  loadHospital,
  loadSubmission,
} from "@/utils/helpers"
import type { HospitalId } from "@/lib/hospitals"
import type {
  Answers,
  Language,
  QuestionId,
  SubmitStatus,
  SubmissionSnapshot,
} from "@/types/pima-afya"

export type ViewState = "form" | "success" | "thank-you"

export function usePimaAfya() {
  const [answers, setAnswers] = useState<Answers>(() => loadAnswers())
  const [language, setLanguageState] = useState<Language>(() => loadLanguage())
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [phone, setPhone] = useState(() => loadSubmission()?.phone || "")
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [hospitalId, setHospitalId] = useState<HospitalId | "">(
    () => loadSubmission()?.hospitalId || loadHospital() || ""
  )
  const [submission, setSubmission] = useState<SubmissionSnapshot | null>(() =>
    loadSubmission()
  )
  const [view, setView] = useState<ViewState>(() =>
    loadSubmission() ? "success" : "form"
  )

  const saveToSupabase = useCallback(
    async (
      normalizedPhone: string,
      selectedHospital: HospitalId,
      finalSubmit: boolean = false
    ) => {
      const finalAnswers = loadAnswers()
      const finalScore = computeScore(finalAnswers)
      const scoreBand = getRiskBand(finalScore)
      const now = new Date().toISOString()

      const { error: dbError } = await supabase.from("submissions").upsert(
        {
          phone: normalizedPhone,
          score_band: scoreBand,
          hospital_id: selectedHospital,
          answers: finalAnswers,
          language: loadLanguage(),
          submitted_at: now,
          updated_at: now,
        },
        { onConflict: "phone" }
      )

      if (dbError) throw dbError

      const snapshot: SubmissionSnapshot = {
        phone: normalizedPhone,
        hospitalId: selectedHospital,
        scoreBand,
        score: finalScore,
        submittedAt: now,
        updatedAt: now,
      }

      localStorage.setItem(SUBMISSION_KEY, JSON.stringify(snapshot))
      setSubmission(snapshot)

      if (finalSubmit) {
        setView("thank-you")
      } else {
        setView("success")
      }
      setStatus("saved")
    },
    []
  )

  useEffect(() => {
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers))
  }, [answers])

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language)
  }, [language])

  useEffect(() => {
    if (hospitalId) localStorage.setItem(HOSPITAL_KEY, hospitalId)
  }, [hospitalId])

  const setAnswer = useCallback((id: QuestionId, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }, [])

  const submit = useCallback(
    async (isFinal: boolean = false) => {
      if (!checkComplete(answers)) return
      
      if (!isFinal) {
        setView("success")
        return
      }

      if (!hospitalId) return

      setError(null)
      const normalizedPhone = normalizeKenyanPhone(phone)

      if (!normalizedPhone.ok) {
        setPhoneError(
          normalizedPhone.reason === "country"
            ? "This app is not available in your country yet."
            : "Enter a valid Kenyan phone number."
        )
        setStatus("idle")
        return
      }

      setPhoneError(null)
      setStatus("saving")

      try {
        await saveToSupabase(
          normalizedPhone.e164,
          hospitalId as HospitalId,
          true
        )
      } catch (e: any) {
        console.error("Submission error:", e)
        setStatus("error")
        setError(e instanceof Error ? e.message : "Something went wrong")
      }
    },
    [answers, hospitalId, phone, saveToSupabase]
  )

  const clearAnswers = useCallback(() => {
    setAnswers({})
    setHospitalId("")
    setPhone("")
    setPhoneError(null)
    setStatus("idle")
    setView("form")
    localStorage.removeItem(SUBMISSION_KEY)
    localStorage.removeItem(ANSWERS_KEY)
    localStorage.removeItem(HOSPITAL_KEY)
    setSubmission(null)
  }, [])

  const resetToHome = useCallback(() => {
    clearAnswers()
  }, [clearAnswers])

  const complete = checkComplete(answers)
  const score = complete ? computeScore(answers) : null

  return {
    questions: QUESTIONS,
    answers,
    setAnswer,
    language,
    setLanguage: setLanguageState,
    answeredCount: QUESTIONS.filter((q) => answers[q.id] !== undefined).length,
    totalQuestions: QUESTIONS.length,
    isComplete: complete,
    score,
    riskBand: score !== null ? getRiskBand(score) : null,
    status,
    error,
    phone,
    setPhone,
    phoneError,
    setPhoneError,
    submit,
    hospitalId,
    setHospitalId,
    submission,
    view,
    clearAnswers,
    resetToHome,
  }
}
