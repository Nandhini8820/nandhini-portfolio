import { jsonResponse } from '../test/helpers';
import { ApiError, apiRequest } from './apiClient';

describe('apiRequest', () => {
  it('returns parsed JSON for a successful response', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(200, { ok: true }));

    await expect(apiRequest('/api/portfolio', { fetchImpl, baseUrl: 'http://api.test' })).resolves.toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledWith('http://api.test/api/portfolio', expect.objectContaining({ method: 'GET' }));
  });

  it('sends JSON bodies for POST requests', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(202, { id: '1' }));

    await apiRequest('/api/contact', { method: 'POST', body: { name: 'A' }, fetchImpl });

    const [, init] = fetchImpl.mock.calls[0];
    expect(init.body).toBe('{"name":"A"}');
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('maps ASP.NET Core validation problems to camelCase field errors', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      jsonResponse(400, { title: 'One or more validation errors occurred.', errors: { Email: ['Enter a valid email.'], message: ['Too short.'] } }),
    );

    const error = await apiRequest('/api/contact', { fetchImpl }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).kind).toBe('validation');
    expect((error as ApiError).fieldErrors).toEqual({ email: 'Enter a valid email.', message: 'Too short.' });
  });

  it('reports rate limiting with the server’s explanation', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(429, { detail: 'Wait a minute and try again.' }));

    await expect(apiRequest('/api/contact', { fetchImpl })).rejects.toMatchObject({ kind: 'rateLimited', message: 'Wait a minute and try again.' });
  });

  it('reports server errors', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(503, { title: 'Message not delivered' }));

    await expect(apiRequest('/api/contact', { fetchImpl })).rejects.toMatchObject({ kind: 'server', status: 503 });
  });

  it('reports network failures', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(apiRequest('/api/portfolio', { fetchImpl })).rejects.toMatchObject({ kind: 'network' });
  });

  it('times out slow requests', async () => {
    jest.useFakeTimers();
    const fetchImpl = jest.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        }),
    );

    const pending = apiRequest('/api/portfolio', { fetchImpl: fetchImpl as unknown as typeof fetch, timeoutMs: 50 });
    jest.advanceTimersByTime(60);

    await expect(pending).rejects.toMatchObject({ kind: 'timeout' });
    jest.useRealTimers();
  });
});
