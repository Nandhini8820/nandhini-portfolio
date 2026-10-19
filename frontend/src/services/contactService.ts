import type { ContactRequest, ContactResponse } from '../types/portfolio';
import { apiRequest, type RequestOptions } from './apiClient';

type Options = Pick<RequestOptions, 'signal' | 'fetchImpl' | 'baseUrl'>;

export const contactService = {
  send: (request: ContactRequest, options?: Options) =>
    apiRequest<ContactResponse>('/api/contact', { ...options, method: 'POST', body: request }),
};
