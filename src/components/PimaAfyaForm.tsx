import { useEffect, useRef, useState } from 'react';
import { usePimaAfya } from '@/hooks/usePimaAfya';
import { QuestionCard } from './QuestionCard';
import { ResultScreen } from './ResultScreen';
import { SuccessScreen } from './SuccessScreen';
import { LanguageToggle } from './LanguageToggle';
import { SubmissionCounter } from './SubmissionCounter';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

/** Bilingual intro copy */
const INTRO = {
  tagline: {
    en: 'Diabetes Risk Self-Screening Tool',
    sw: 'Zana ya Kujipima Hatari ya Kisukari',
  },
  description: {
    en: 'Answer seven quick questions to understand your diabetes risk — no account needed. The whole thing takes under 60 seconds. A Google sign-in is only asked for at the very end, so you can screen yourself freely and privately before committing to anything.',
    sw: 'Jibu maswali saba mafupi ili kujua hatari yako ya kisukari — hakuna akaunti inayohitajika. Inachukua chini ya sekunde 60. Kuingia kwa Google kunaulizwa mwishoni tu, ili uweze kujipima kwa uhuru na faragha bila sharti lolote.',
  },
  clear: {
    en: 'Clear all answers',
    sw: 'Futa majibu yote',
  },
};

const THANK_YOU = {
  title: {
    en: 'Thank you for your submission!',
    sw: 'Asante kwa kuwasilisha!',
  },
  message: {
    en: 'Your responses have been recorded successfully. A health provider from your selected hospital will be in touch with you shortly.',
    sw: 'Majibu yako yamehifadhiwa kwa mafanikio. Mtoa huduma wa afya kutoka hospitali uliyochagua atawasiliana nawe hivi karibuni.',
  },
  button: {
    en: 'Submit another response',
    sw: 'Wasilisha jibu lingine',
  },
};

export function PimaAfyaForm() {
  const {
    questions, answers, setAnswer, language, setLanguage,
    answeredCount, totalQuestions, isComplete,
    hospitalId, setHospitalId, status, submit,
    submission, view, clearAnswers, resetToHome,
  } = usePimaAfya();

  // Sentinel element at the very top of the form — used to detect
  // whether the user has scrolled past the header area.
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const [topVisible, setTopVisible] = useState(true);

  useEffect(() => {
    const el = topSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTopVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hasAnswers = answeredCount > 0;
  const isSuccessView = view === 'success' && submission;
  const isThankYouView = view === 'thank-you';

  // Only show the clear button while the form (not success/thank-you screen) is visible
  // and the user has answered at least one question.
  const showClear = view === 'form' && hasAnswers;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      {/* Top sentinel — sits at the very top, tracked by IntersectionObserver */}
      <div ref={topSentinelRef} aria-hidden="true" />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Pima Afya
          </h1>
          <LanguageToggle language={language} onChange={setLanguage} />
        </div>
        {view === 'form' && (
          <>
            <h2 className="text-lg font-semibold leading-snug">
              {INTRO.tagline[language]}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {INTRO.description[language]}
            </p>
          </>
        )}
      </header>

      {/* ── Clear button pinned to top (visible when header is in view) ─ */}
      {showClear && topVisible && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearAnswers}
            className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
          >
            {INTRO.clear[language]}
          </button>
        </div>
      )}

      <SubmissionCounter language={language} />

      {isThankYouView ? (
        <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">{THANK_YOU.title[language]}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {THANK_YOU.message[language]}
            </p>
          </div>
          <Button onClick={resetToHome} variant="outline">
            {THANK_YOU.button[language]}
          </Button>
        </div>
      ) : isSuccessView ? (
        <SuccessScreen 
          snapshot={submission} 
          language={language}
          selectedHospitalId={hospitalId}
          onHospitalChange={setHospitalId}
          onSubmit={submit}
          onCancel={resetToHome}
          status={status}
        />
      ) : (
        <>
          <Progress value={(answeredCount / totalQuestions) * 100} />
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              value={answers[q.id]}
              language={language}
              onChange={(value) => setAnswer(q.id, value)}
            />
          ))}
          {isComplete && (
            <ResultScreen
              language={language}
              status={status}
              onSubmit={() => submit(false)}
            />
          )}
        </>
      )}

      {/* ── Clear button fixed to bottom (when user has scrolled past header) ─ */}
      {showClear && !topVisible && (
        <div className="fixed bottom-6 right-5 z-50 pointer-events-none">
          <div className="pointer-events-auto bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-border">
            <button
              type="button"
              onClick={clearAnswers}
              className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
            >
              {INTRO.clear[language]}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
