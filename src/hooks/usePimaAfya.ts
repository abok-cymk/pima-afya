import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
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

export type ViewState = "form" | "success" | "thank-you";

export function usePimaAfya() {
  const [answers, setAnswers] = useState<Answers>(() => loadAnswers())
  const [language, setLanguageState] = useState<Language>(() => loadLanguage())
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [hospitalId, setHospitalId] = useState<HospitalId | "">(() => loadHospital() || "")
  const [submission, setSubmission] = useState<SubmissionSnapshot | null>(() =>
    loadSubmission()
  )
  const [view, setView] = useState<ViewState>(() =>
    loadSubmission() ? "success" : "form"
  )

  const saveToSupabase = useCallback(
    async (
      uid: string, 
      email: string, 
      selectedHospital: HospitalId,
      finalSubmit: boolean = false
    ) => {
      const finalAnswers = loadAnswers()
      const finalScore = computeScore(finalAnswers)
      const scoreBand = getRiskBand(finalScore)
      const now = new Date().toISOString()

      const { error: dbError } = await supabase
        .from('submissions')
        .upsert({
          email: email,
          uid: uid,
          score_band: scoreBand,
          hospital_id: selectedHospital,
          answers: finalAnswers,
          language: loadLanguage(),
          submitted_at: now,
          updated_at: now,
          // We can add a flag here if we want to track 'final' vs 'draft'
        }, { onConflict: 'email' })

      if (dbError) throw dbError

      const snapshot: SubmissionSnapshot = {
        uid,
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

  const setAnswer = useCallback((id: QuestionId, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }, [])

  const submit = useCallback(async (isFinal: boolean = false) => {
    if (!checkComplete(answers) || (isFinal && !hospitalId)) return
    setError(null)
    setStatus("saving")

    try {
      const { data: { session } } = await supabase.auth.getSession()
      let user = session?.user

      if (!user) {
        setStatus("signing-in")
        const { error: authError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          }
        })
        if (authError) throw authError
        return
      }

      if (!user.email) throw new Error("Email is required for submission.")
      
      // If it's the final submit from SuccessScreen, we use the hospitalId
      // If it's the first submit from ResultScreen, we might not have hospitalId yet
      // but the UI logic ensures we have it for final.
      await saveToSupabase(user.id, user.email, hospitalId as HospitalId, isFinal)

    } catch (e: any) {
      console.error("Submission error:", e)
      setStatus("error")
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
  }, [answers, hospitalId, saveToSupabase])

  useEffect(() => {
    const handleAuthChange = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        const savedHospital = loadHospital()
        if (status === "idle" && !submission) {
          try {
            setStatus("saving")
            // Default to non-final save on initial auth redirect
            await saveToSupabase(session.user.id, session.user.email, (savedHospital || "") as HospitalId, false)
          } catch (e) {
            console.error("Post-auth save error:", e)
            setStatus("error")
          }
        }
      }
    }
    handleAuthChange()
  }, [saveToSupabase, submission, status])

  const clearAnswers = useCallback(() => {
    setAnswers({})
    setHospitalId("")
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
    submit,
    hospitalId,
    setHospitalId,
    submission,
    view,
    clearAnswers,
    resetToHome,
  }
}
