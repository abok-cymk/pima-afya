import { Button } from '@/components/ui/button';
import type { Language, SubmitStatus } from '@/types/pima-afya';

const SUBMIT_PROMPT = {
  en: 'Click below to submit your responses and select a hospital for follow-up.',
  sw: 'Bonyeza hapa chini kuwasilisha majibu yako na kuchagua hospitali kwa ufuatiliaji.',
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

      <Button onClick={onSubmit} disabled={status === 'signing-in' || status === 'saving'}>
        {status === 'saved'
          ? (language === 'sw' ? 'Imehifadhiwa' : 'Saved')
          : (language === 'sw' ? 'Hifadhi majibu yangu' : 'Save my responses')}
      </Button>
      {status === 'error' && <p className="text-sm text-destructive">{language === 'sw' ? 'Hitilafu imetokea — tafadhali jaribu tena.' : 'Something went wrong — please try again.'}</p>}
    </div>
  );
}
