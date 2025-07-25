import { useEffect } from 'react';
import { QueryClient } from '@tanstack/react-query';

export interface SseListenerOptions {
  url: string;
  events: string[];
  queryClient: QueryClient;
}

export function useSseListener({ url, events, queryClient }: SseListenerOptions) {
  useEffect(() => {
    const source = new EventSource(url);
    for (const event of events) {
      source.addEventListener(event, (e) => {
        try {
          const data = JSON.parse((e as MessageEvent).data);
          if (data.id) {
            queryClient.invalidateQueries(['job', data.id]);
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
