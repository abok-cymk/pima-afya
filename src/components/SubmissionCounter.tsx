import { Card } from '@/components/ui/card';
import { useSubmissionCount } from '@/hooks/useSubmissionCount';
import type { Language } from '@/types/pima-afya';

const LABEL = { en: 'People screened so far', sw: 'Watu waliopimwa hadi sasa' };

export function SubmissionCounter({ language }: { language: Language }) {
  const count = useSubmissionCount();

  return (
    <Card className="flex items-center justify-between p-4">
      <span className="text-sm text-muted-foreground">{LABEL[language]}</span>
      <span className="text-2xl font-medium text-primary" data-testid="submission-count">
        {count === null ? '—' : count}
      </span>
    </Card>
  );
}