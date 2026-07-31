import { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

export function SmokeTestCheckbox() {
  const [checked, setChecked] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function handleChange(value: boolean) {
    setChecked(value);
    setStatus('saving');
    try {
      await setDoc(doc(db, 'smoke_test', 'ping'), {
        checked: value,
        updatedAt: serverTimestamp(),
      });
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  return (
    <Card className="flex items-center gap-3 p-4">
      <Checkbox checked={checked} onCheckedChange={handleChange} id="smoke-test" />
      <label htmlFor="smoke-test">Firestore wiring test</label>
      <span data-testid="status" className="text-sm text-muted-foreground">
        {status}
      </span>
    </Card>
  );
}