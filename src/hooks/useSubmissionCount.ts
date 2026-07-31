import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useSubmissionCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Initial fetch: Count rows in the submissions table
    const fetchCount = async () => {
      try {
        const { count: rowCount, error } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true });
        
        if (!error && rowCount !== null) {
          setCount(rowCount);
        } else {
          setCount(0);
        }
      } catch (e) {
        console.error('Error fetching submission count:', e);
        setCount(0);
      }
    };

    fetchCount();

    // Subscribe to INSERT events on the submissions table
    // This makes the counter update in real-time when a new user submits
    const channel = supabase
      .channel('public:submissions')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'submissions' },
        () => {
          // When a new row is inserted, increment the local count
          setCount((prev) => (prev !== null ? prev + 1 : 1));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
