import { Button } from '@/components/ui/button';
import type { Language } from '@/types/pima-afya';

export function LanguageToggle({
  language,
  onChange,
}: {
  language: Language;
  onChange: (lang: Language) => void;
}) {
  return (
    <div className="flex gap-2">
      <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => onChange('en')}>
        English
      </Button>
      <Button variant={language === 'sw' ? 'default' : 'outline'} size="sm" onClick={() => onChange('sw')}>
        Kiswahili
      </Button>
    </div>
  );
}