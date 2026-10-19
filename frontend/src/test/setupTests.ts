import '@testing-library/jest-dom';

// jsdom does not implement these browser APIs; provide quiet, controllable stand-ins.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

class MockIntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];
  constructor(private readonly callback: IntersectionObserverCallback) {}
  observe(target: Element) {
    this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
Object.defineProperty(window, 'IntersectionObserver', { writable: true, configurable: true, value: MockIntersectionObserver });

window.scrollTo = jest.fn() as unknown as typeof window.scrollTo;

beforeEach(() => {
  (window.scrollTo as jest.Mock).mockClear();
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
});
