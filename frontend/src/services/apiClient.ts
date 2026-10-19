import { env } from '../config/env';

export type ApiErrorKind = 'network' | 'timeout' | 'validation' | 'rateLimited' | 'server' | 'notFound' | 'aborted';

/** A failed API call, normalized from ASP.NET Core problem details or a network failure. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  /** Field name (camelCase) to the first error message for that field. */
  readonly fieldErrors: Record<string, string>;

  constructor(kind: ApiErrorKind, message: string, status: number | null = null, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Injected in tests; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
  baseUrl?: string;
}

function toFieldErrors(errors: ProblemDetails['errors']): Record<string, string> {
  const result: Record<string, string> = {};
  if (!errors) return result;
  for (const [key, messages] of Object.entries(errors)) {
    if (!messages?.length) continue;
    // Normalize "Email" or "email" to "email" so the form can match it.
    const field = key.charAt(0).toLowerCase() + key.slice(1);
    result[field] = messages[0];
  }
  return result;
}

async function readProblem(response: Response): Promise<ProblemDetails> {
  try {
    return (await response.json()) as ProblemDetails;
  } catch {
    return {};
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    signal,
    timeoutMs = env.requestTimeoutMs,
    fetchImpl = globalThis.fetch,
    baseUrl = env.apiBaseUrl,
  } = options;

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort);

  let response: Response;
  try {
    response = await fetchImpl(`${baseUrl}${path}`, {
      method,
      headers: body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    if (timedOut) throw new ApiError('timeout', 'The server took too long to respond.');
    if (signal?.aborted) throw new ApiError('aborted', 'The request was cancelled.');
    throw new ApiError('network', 'Couldn’t reach the server. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }

  if (response.ok) {
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  const problem = await readProblem(response);
  const detail = problem.detail ?? problem.title ?? `Request failed with status ${response.status}.`;

  switch (response.status) {
    case 400:
      return Promise.reject(new ApiError('validation', 'Some fields need attention.', 400, toFieldErrors(problem.errors)));
    case 404:
      return Promise.reject(new ApiError('notFound', detail, 404));
    case 429:
      return Promise.reject(new ApiError('rateLimited', detail, 429));
    default:
      return Promise.reject(new ApiError('server', detail, response.status));
  }
}
