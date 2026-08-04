import { Button } from '@/components/ui/button';
import type { Language, SubmitStatus } from '@/types/pima-afya';

const SUBMIT_PROMPT = {
  en: 'Your screening is complete. Continue to save your results and select a hospital for follow-up.',
  sw: 'Uchunguzi wako umekamilika. Endelea ili kuhifadhi matokeo yako na uchague hospitali kwa ufuatiliaji.',
};

const CONTINUE_BUTTON = {
  en: 'Continue to save',
  sw: 'Endelea kuhifadhi',
};

export function ResultScreen({
  language,
  status,
  onSubmit,
}: {
  language: Language;
  status: SubmitStatus;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">{SUBMIT_PROMPT[language]}</p>
      </div>

      <Button onClick={onSubmit} disabled={status === 'saving'}>
        {CONTINUE_BUTTON[language]}
      </Button>
      {status === 'error' && (
        <p className="text-sm text-destructive">
          {language === 'sw' ? 'Hitilafu imetokea — tafadhali jaribu tena.' : 'Something went wrong — please try again.'}
        </p>
      )}
    </div>
  );
}
