import { useEffect } from 'react';
import { Job } from '@async-workers/shared-types';
import { useToast } from '@/hooks/useToast';
import { queryClient } from '@/utils/queries';
import { useJobActions } from '@/hooks/useJobStore';

export function useSseListener(id: Nullish<string>) {
  const url = `/api/sse/${id}`;

  const { toast } = useToast();
  const { setJob } = useJobActions();
  useEffect(() => {
    if (!id) return;
    const events = ['job-updated', 'job-done', 'job-canceled'];
    const source = new EventSource(url);
    source.addEventListener('stop', () => source.close());

    for (const event of events) {
      source.addEventListener(event, (e) => {
        try {
          const data: Job = JSON.parse(e.data);
          if (data.id) {
            queryClient.setQueryData(['job', data.id], data);
            setJob(data);
          }
        } catch (e) {
          console.error(e);
          toast({
            title: 'Error processing SSE event',
            variant: 'destructive',
          });
        }
      });
    }
    return () => {
      source.close();
    };
  }, [url, toast, id, setJob]);
}
