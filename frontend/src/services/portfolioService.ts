import type { PortfolioContent, Project } from '../types/portfolio';
import { apiRequest, type RequestOptions } from './apiClient';

type Options = Pick<RequestOptions, 'signal' | 'fetchImpl' | 'baseUrl'>;

export const portfolioService = {
  getPortfolio: (options?: Options) => apiRequest<PortfolioContent>('/api/portfolio', options),
  getProjects: (options?: Options) => apiRequest<Project[]>('/api/projects', options),
  getProject: (id: string, options?: Options) => apiRequest<Project>(`/api/projects/${encodeURIComponent(id)}`, options),
};
