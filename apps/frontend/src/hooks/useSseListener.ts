import { useEffect } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { Job } from '@async-workers/shared-types';

export interface SseListenerOptions {
  url: string;
  events: string[];
  queryClient: QueryClient;
}

export function useSseListener({
  url,
  events,
  queryClient,
}: SseListenerOptions) {
  useEffect(() => {
    const source = new EventSource(url);
    source.addEventListener('stop', () => source.close());

    for (const event of events) {
      source.addEventListener(event, (e) => {
        try {
          const data: Job = JSON.parse(e.data);
          if (data.id) {
            queryClient.setQueryData(['job', data.id], data);
          }
          queryClient.invalidateQueries(['jobs']);
        } catch {
          queryClient.invalidateQueries(['jobs']);
        }
      });
    }
    return () => {
      source.close();
    };
  }, [url, events, queryClient]);
}
