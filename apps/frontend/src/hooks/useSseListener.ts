import { useEffect, useMemo } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { Job } from '@async-workers/shared-types';
import { useToast } from '@/hooks/use-toast';
import { queryClient as defaultQueryClient } from '@/utils/queries';

export interface SseListenerOptions {
  id: Insecure<string>;
  url?: string;
  events?: string[];
  queryClient?: QueryClient;
}

export function useSseListener({
  id,
  url = `/api/sse/${id}`,
  events = ['job-updated', 'job-done', 'job-canceled'],
  queryClient = defaultQueryClient,
}: SseListenerOptions) {
  const { toast } = useToast();
  const source = useMemo(() => new EventSource(url), [url]);
  useEffect(() => {
    if (!id || !source) return;
    source.addEventListener('stop', () => source.close());

    for (const event of events) {
      source.addEventListener(event, (e) => {
        try {
          const data: Job = JSON.parse(e.data);
          if (data.id) {
            queryClient.setQueryData(['job', data.id], data);
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
  }, [url, events, queryClient, toast, id, source]);
}
