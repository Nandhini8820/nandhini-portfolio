import content from '../../../content/portfolio.json';
import type { PortfolioContent } from '../types/portfolio';

/**
 * The same file the API serves. Used to render instantly and as a fallback
 * when the API can't be reached, so the portfolio never shows a blank page.
 */
export const fallbackContent = content as PortfolioContent;
