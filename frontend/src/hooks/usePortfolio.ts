import { useEffect, useState } from 'react';
import { env } from '../config/env';
import { fallbackContent } from '../data/fallbackContent';
import { portfolioService } from '../services/portfolioService';
import type { PortfolioContent } from '../types/portfolio';

export type ContentSource = 'loading' | 'api' | 'fallback';

/**
 * Renders the bundled content immediately (no blank page or layout jump), then
 * swaps in the live content from the .NET API. If the API is unreachable the
 * bundled copy stays, so visitors always see the portfolio.
 */
export function usePortfolio(service = portfolioService) {
  const [content, setContent] = useState<PortfolioContent>(fallbackContent);
  const [source, setSource] = useState<ContentSource>('loading');

  useEffect(() => {
    const controller = new AbortController();

    service
      .getPortfolio({ signal: controller.signal })
      .then((data) => {
        setContent(data);
        setSource('api');
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (env.isDev) console.warn('Portfolio API unavailable; showing bundled content.', error);
        setSource('fallback');
      });

    return () => controller.abort();
  }, [service]);

  return { content, source };
}
