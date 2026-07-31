import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { Question } from '@/lib/questions';
import type { Language } from '@/types/pima-afya';

export function QuestionCard({
  question,
  value,
  language,
  onChange,
}: {
  question: Question;
  value: boolean | undefined;
  language: Language;
  onChange: (value: boolean) => void;
}) {
  return (
    <Card className="p-4">
      <p className="mb-3 text-lg font-medium">{question.text[language]}</p>
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2">
          <Checkbox checked={value === true} onCheckedChange={() => onChange(true)}
          data-testid={`${question.id}-yes`}
          />
          {question.yesLabel[language]}
        </label>
        <label className="flex items-center gap-2">
          <Checkbox checked={value === false} onCheckedChange={() => onChange(false)} 
            data-testid={`${question.id}-no`}
            />
          {question.noLabel[language]}
        </label>
      </div>
    </Card>
  );
}